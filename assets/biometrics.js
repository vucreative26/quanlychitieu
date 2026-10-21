// Device-local WebAuthn verification for this app's privacy lock.
// Credential metadata stays outside financial backups. No biometric data is read.
const biometricAuth = (() => {
  const storageKey = 'fintech_pwa_biometric_v1';
  const encoder = new TextEncoder();
  let busy = false;
  let generation = 0;
  let controller;
  const state = { pinPassed: false, fallback: false };
  const encode = buffer => btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const decode = value => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0));
  const read = () => {
    try {
      const record = JSON.parse(localStorage.getItem(storageKey));
      return record?.origin === location.origin && record.rpId === location.hostname && record.credentialId && record.publicKey ? record : null;
    } catch { return null; }
  };
  const supported = async () => {
    try {
      const validHost = !/^\d+\.\d+\.\d+\.\d+$/.test(location.hostname) && !location.hostname.includes(':');
      return !!(validHost && window.isSecureContext && window.PublicKeyCredential && navigator.credentials &&
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
    } catch { return false; }
  };
  const random = () => crypto.getRandomValues(new Uint8Array(32));
  const message = text => { document.getElementById('pin-error').textContent = text; };
  function validateClient(response, challenge, type) {
    const data = JSON.parse(new TextDecoder().decode(response.clientDataJSON));
    if (data.type !== type || data.challenge !== encode(challenge) || data.origin !== location.origin || data.crossOrigin) {
      throw new Error('Thông tin xác thực không khớp yêu cầu của ứng dụng.');
    }
  }
  async function validateAuthenticator(buffer) {
    const data = new Uint8Array(buffer);
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(location.hostname)));
    if (data.length < 37 || !hash.every((byte, index) => data[index] === byte) || (data[32] & 5) !== 5) {
      throw new Error('Thiết bị chưa xác nhận người dùng hoặc sai tên miền.');
    }
    return new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(33);
  }
  // WebAuthn's ASN.1 DER ECDSA signature -> Web Crypto's P-256 r || s.
  function rawSignature(signature) {
    const der = new Uint8Array(signature);
    if (der[0] !== 0x30 || der[1] !== der.length - 2 || der[2] !== 0x02) throw new Error('Chữ ký không hợp lệ.');
    let offset = 3;
    const rLength = der[offset++];
    let r = der.slice(offset, offset + rLength); offset += rLength;
    if (der[offset++] !== 0x02) throw new Error('Chữ ký không hợp lệ.');
    const sLength = der[offset++];
    let s = der.slice(offset, offset + sLength);
    if (offset + sLength !== der.length) throw new Error('Chữ ký không hợp lệ.');
    if (r.length === 33 && r[0] === 0) r = r.slice(1);
    if (s.length === 33 && s[0] === 0) s = s.slice(1);
    if (!r.length || !s.length || r.length > 32 || s.length > 32) throw new Error('Chữ ký không hợp lệ.');
    const raw = new Uint8Array(64);
    raw.set(r, 32 - r.length); raw.set(s, 64 - s.length);
    return raw;
  }
  async function settings() {
    const record = read();
    const available = await supported();
    const enable = document.getElementById('biometric-enable');
    const disable = document.getElementById('biometric-disable');
    enable.classList.toggle('hidden', !!record);
    enable.disabled = !available || busy;
    disable.classList.toggle('hidden', !record);
    disable.disabled = busy;
    document.getElementById('biometric-settings-status').textContent = record
      ? 'Đã bật: nhập PIN rồi xác thực thiết bị. PIN dự phòng vẫn dùng được.'
      : available ? 'Thiết bị hỗ trợ. Chưa bật trên trình duyệt này.'
        : 'Chưa khả dụng: cần tên miền HTTPS (hoặc localhost), trình duyệt hỗ trợ và thiết bị có xác thực màn hình khóa.';
  }
  async function enroll() {
    if (busy || !document.getElementById('pin-lock-modal').classList.contains('hidden')) return;
    if (!await supported()) { await settings(); return; }
    busy = true;
    const challenge = random();
    try {
      const credential = await navigator.credentials.create({ publicKey: {
        challenge, rp: { name: 'Ví Thông Minh', id: location.hostname },
        user: { id: random(), name: 'vi-ca-nhan', displayName: 'Ví cá nhân trên thiết bị này' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
        attestation: 'none', timeout: 60000
      } });
      if (!credential || !credential.response.getPublicKey || !credential.response.getAuthenticatorData) {
        throw new Error('Trình duyệt chưa hỗ trợ đăng ký. Hãy cập nhật trình duyệt rồi thử lại.');
      }
      validateClient(credential.response, challenge, 'webauthn.create');
      const counter = await validateAuthenticator(credential.response.getAuthenticatorData());
      const publicKey = credential.response.getPublicKey();
      if (!publicKey || credential.response.getPublicKeyAlgorithm() !== -7) throw new Error('Thiết bị không hỗ trợ loại khóa cần thiết.');
      await crypto.subtle.importKey('spki', publicKey, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      localStorage.setItem(storageKey, JSON.stringify({
        origin: location.origin, rpId: location.hostname,
        credentialId: encode(credential.rawId), publicKey: encode(publicKey), counter
      }));
      showToast('Đã bật bước xác thực thiết bị sau PIN.');
    } catch (error) {
      showToast(error.name === 'NotAllowedError' ? 'Đã hủy hoặc hết thời gian đăng ký. PIN vẫn dùng bình thường.' : error.message);
    } finally { busy = false; await settings(); }
  }
  async function verify() {
    if (busy || !state.pinPassed) return;
    const record = read();
    if (!record) { message('Chưa có khóa trên thiết bị này. Hãy dùng PIN dự phòng.'); return; }
    busy = true;
    const currentGeneration = generation;
    controller = new AbortController();
    document.getElementById('biometric-retry').disabled = true;
    message('Đang chờ xác thực thiết bị…');
    try {
      const challenge = random();
      const credential = await navigator.credentials.get({ signal: controller.signal, publicKey: {
        challenge, rpId: record.rpId, allowCredentials: [{ id: decode(record.credentialId), type: 'public-key' }],
        userVerification: 'required', timeout: 60000
      } });
      if (!credential || encode(credential.rawId) !== record.credentialId) throw new Error('Khóa xác thực không khớp.');
      validateClient(credential.response, challenge, 'webauthn.get');
      const counter = await validateAuthenticator(credential.response.authenticatorData);
      const clientHash = new Uint8Array(await crypto.subtle.digest('SHA-256', credential.response.clientDataJSON));
      const authenticatorData = new Uint8Array(credential.response.authenticatorData);
      const signedData = new Uint8Array(authenticatorData.length + clientHash.length);
      signedData.set(authenticatorData); signedData.set(clientHash, authenticatorData.length);
      const key = await crypto.subtle.importKey('spki', decode(record.publicKey), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, rawSignature(credential.response.signature), signedData);
      if (!valid || (record.counter > 0 && counter > 0 && counter <= record.counter)) throw new Error('Không xác minh được chữ ký thiết bị.');
      if (generation !== currentGeneration || !state.pinPassed) return;
      record.counter = counter;
      localStorage.setItem(storageKey, JSON.stringify(record));
      reset();
      unlockApp();
    } catch (error) {
      if (generation === currentGeneration) message(error.name === 'NotAllowedError' || error.name === 'AbortError'
        ? 'Chưa xác thực. Thử lại hoặc dùng PIN dự phòng.' : error.message);
    } finally {
      busy = false;
      document.getElementById('biometric-retry').disabled = false;
    }
  }
  function reset() {
    generation++;
    controller?.abort();
    state.pinPassed = false; state.fallback = false;
    document.getElementById('biometric-login').classList.add('hidden');
    document.getElementById('pin-keypad').classList.remove('hidden');
  }
  function completePin() {
    if (read() && !state.fallback) {
      state.pinPassed = true;
      document.getElementById('pin-keypad').classList.add('hidden');
      document.getElementById('biometric-login').classList.remove('hidden');
      // A separate tap preserves the browser's user activation on iOS, where
      // the PIN keypad intentionally processes touchstart before touchend.
      message('PIN đúng. Bấm nút bên dưới để xác thực thiết bị.');
    } else { reset(); unlockApp(); }
  }
  function fallback() {
    reset(); state.fallback = true;
    clearPin();
    message('Nhập lại mã PIN để dùng chế độ dự phòng lần này.');
  }
  function disable() {
    if (!document.getElementById('pin-lock-modal').classList.contains('hidden')) return;
    if (!confirm('Tắt bước xác thực thiết bị? App sẽ mở bằng mã PIN.')) return;
    localStorage.removeItem(storageKey);
    reset(); settings();
    showToast('Đã tắt bước xác thực thiết bị.');
  }
  return { settings, enroll, verify, reset, completePin, fallback, disable, state };
})();

function updateBiometricSettings() { return biometricAuth.settings(); }
function enableBiometrics() { return biometricAuth.enroll(); }
function disableBiometrics() { return biometricAuth.disable(); }
function completePinLogin() { return biometricAuth.completePin(); }
function verifyBiometricLogin() { return biometricAuth.verify(); }
function usePinFallback() { return biometricAuth.fallback(); }
function resetBiometricLogin() { return biometricAuth.reset(); }

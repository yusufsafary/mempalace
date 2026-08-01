/* ============================================
   MEMPALACE — Wallet Connection
   Metamask (EVM) + Phantom (Solana)
   ============================================ */

(function() {
  'use strict';

  var SESSION_KEY = 'mp_session';

  function setWalletSession(address, walletType) {
    var short = address.length > 12
      ? address.slice(0, 6) + '...' + address.slice(-4)
      : address;

    var session = {
      id: 'wallet_' + address.toLowerCase(),
      name: short,
      address: address,
      walletType: walletType,
      type: 'wallet',
      plan: 'free',
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function showWalletStatus(btnId, type, message) {
    // type: 'success' | 'error'
    var statusEl = document.getElementById(btnId + 'Status');
    if (!statusEl) return;
    statusEl.className = 'wallet-status ' + type;
    statusEl.innerHTML = (type === 'success' ? '&#10003; ' : '&#9888; ') + message;
    statusEl.style.display = 'flex';
  }

  function clearWalletStatus(btnId) {
    var statusEl = document.getElementById(btnId + 'Status');
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.className = 'wallet-status';
    }
  }

  // ── Metamask ────────────────────────────────────
  var metamaskBtn = document.getElementById('connectMetamask');
  if (metamaskBtn) {
    metamaskBtn.addEventListener('click', async function() {
      clearWalletStatus('metamask');
      metamaskBtn.disabled = true;
      var originalHtml = metamaskBtn.innerHTML;

      metamaskBtn.innerHTML = '<div class="wallet-icon metamask">&#128246;</div>' +
        '<div class="wallet-btn-text"><span>Connecting...</span><small>Waiting for Metamask</small></div>' +
        '<span class="spinner" style="width:18px;height:18px;border:2px solid rgba(255,255,255,0.2);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;"></span>';

      try {
        if (typeof window.ethereum === 'undefined') {
          showWalletStatus('metamask', 'error', 'Metamask not detected. Please install the Metamask browser extension.');
          metamaskBtn.disabled = false;
          metamaskBtn.innerHTML = originalHtml;
          return;
        }

        var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts returned.');
        }

        var address = accounts[0];
        var chainId = await window.ethereum.request({ method: 'eth_chainId' });
        var session = setWalletSession(address, 'metamask');

        showWalletStatus('metamask', 'success', 'Connected: ' + address.slice(0, 6) + '...' + address.slice(-4));
        window.showToast && window.showToast('Metamask connected. Signing in...', 'success');

        setTimeout(function() {
          window.location.href = 'dashboard.html';
        }, 1200);

      } catch (err) {
        var msg = err.message || 'Connection failed.';
        if (err.code === 4001) {
          msg = 'Connection cancelled by user.';
        } else if (err.code === -32002) {
          msg = 'Metamask already has a pending request. Please check the extension.';
        }
        showWalletStatus('metamask', 'error', msg);
        window.showToast && window.showToast('Metamask: ' + msg, 'error');
      }

      metamaskBtn.disabled = false;
      metamaskBtn.innerHTML = originalHtml;
    });
  }

  // ── Phantom ─────────────────────────────────────
  var phantomBtn = document.getElementById('connectPhantom');
  if (phantomBtn) {
    phantomBtn.addEventListener('click', async function() {
      clearWalletStatus('phantom');
      phantomBtn.disabled = true;
      var originalHtml = phantomBtn.innerHTML;

      phantomBtn.innerHTML = '<div class="wallet-icon phantom">&#128123;</div>' +
        '<div class="wallet-btn-text"><span>Connecting...</span><small>Waiting for Phantom</small></div>' +
        '<span class="spinner" style="width:18px;height:18px;border:2px solid rgba(255,255,255,0.2);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;"></span>';

      try {
        var phantom = window.solana;

        if (!phantom || !phantom.isPhantom) {
          showWalletStatus('phantom', 'error', 'Phantom not detected. Install Phantom wallet from phantom.app.');
          phantomBtn.disabled = false;
          phantomBtn.innerHTML = originalHtml;
          return;
        }

        var resp = await phantom.connect();
        var pubkey = resp.publicKey.toString();

        var session = setWalletSession(pubkey, 'phantom');
        showWalletStatus('phantom', 'success', 'Connected: ' + pubkey.slice(0, 6) + '...' + pubkey.slice(-4));
        window.showToast && window.showToast('Phantom connected. Signing in...', 'success');

        setTimeout(function() {
          window.location.href = 'dashboard.html';
        }, 1200);

      } catch (err) {
        var msg = err.message || 'Connection failed.';
        if (err.code === 4001 || msg.includes('User rejected')) {
          msg = 'Connection cancelled by user.';
        }
        showWalletStatus('phantom', 'error', msg);
        window.showToast && window.showToast('Phantom: ' + msg, 'error');
      }

      phantomBtn.disabled = false;
      phantomBtn.innerHTML = originalHtml;
    });
  }

  // ── Wallet detection indicators ──────────────────
  function updateWalletAvailability() {
    var mmHint = document.getElementById('metamaskHint');
    var phHint = document.getElementById('phantomHint');

    if (mmHint) {
      if (typeof window.ethereum !== 'undefined') {
        mmHint.textContent = 'Metamask detected';
        mmHint.style.color = '#00DC82';
      } else {
        mmHint.innerHTML = 'Not installed. <a href="https://metamask.io/download/" target="_blank" rel="noopener" style="color:#7B2FFF">Install Metamask</a>';
      }
    }

    if (phHint) {
      if (window.solana && window.solana.isPhantom) {
        phHint.textContent = 'Phantom detected';
        phHint.style.color = '#00DC82';
      } else {
        phHint.innerHTML = 'Not installed. <a href="https://phantom.app/download" target="_blank" rel="noopener" style="color:#AB9FF2">Install Phantom</a>';
      }
    }
  }

  // Run after page loads to check installed wallets
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateWalletAvailability);
  } else {
    setTimeout(updateWalletAvailability, 500);
  }

})();

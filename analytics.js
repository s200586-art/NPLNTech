// Amplitude Analytics — NPLN Tech
// Unified custom events for key conversion actions.

(function () {
  if (!window.amplitude || !window.amplitudeAutocapturePlugin) return;

  window.amplitude.add(window.amplitudeAutocapturePlugin.plugin());
  window.amplitude.init('beec1f72b269caa1c4b82d5ea8e3cf76', {
    autocapture: {
      elementInteractions: true,
      pageViews: true,
      sessions: true,
      formInteractions: true
    }
  });

  function normText(el) {
    return (el && el.textContent ? el.textContent : '').trim().replace(/\s+/g, ' ').slice(0, 120);
  }

  function track(eventName, props) {
    window.amplitude.track(eventName, Object.assign({
      page_path: window.location.pathname
    }, props || {}));
  }

  document.addEventListener('click', function (e) {
    var heroCta = e.target.closest('.cta-group a');
    if (heroCta) {
      track('npln_hero_cta_click', {
        cta_text: normText(heroCta),
        href: heroCta.getAttribute('href') || ''
      });
      return;
    }

    var quickbarCta = e.target.closest('[data-quickbar-action]');
    if (quickbarCta) {
      track('npln_mobile_quickbar_click', {
        action: quickbarCta.getAttribute('data-quickbar-action') || 'unknown',
        href: quickbarCta.getAttribute('href') || ''
      });
      return;
    }

    var serviceLink = e.target.closest('.service-card a, a.service-card-link');
    if (serviceLink) {
      var href = serviceLink.getAttribute('href') || '';
      track('npln_service_click', {
        service_text: normText(serviceLink),
        href: href,
        is_learning_hub: /learning-hub\.html/i.test(href)
      });
      return;
    }

    var learningHubLink = e.target.closest('a[href*="learning-hub.html"]');
    if (learningHubLink) {
      track('npln_learning_hub_open', {
        trigger_text: normText(learningHubLink),
        href: learningHubLink.getAttribute('href') || ''
      });
    }
  });

  document.addEventListener('click', function (e) {
    var filterBtn = e.target.closest('[data-case-filter]');
    if (!filterBtn) return;
    track('npln_case_filter_click', {
      filter: filterBtn.getAttribute('data-case-filter') || 'all'
    });
  });

  window.addEventListener('npln:lead_submit', function (e) {
    var detail = e.detail || {};
    track('npln_lead_form_submit', {
      channel: detail.channel || 'unknown',
      has_company: !!detail.hasCompany,
      has_budget: !!detail.hasBudget,
      utm_source: detail.utmSource || '',
      utm_campaign: detail.utmCampaign || '',
      utm_medium: detail.utmMedium || '',
      referrer: detail.referrer || ''
    });
  });

  window.addEventListener('npln:lead_start', function (e) {
    var detail = e.detail || {};
    track('npln_lead_form_start', {
      utm_source: detail.utmSource || '',
      utm_campaign: detail.utmCampaign || '',
      utm_medium: detail.utmMedium || '',
      referrer: detail.referrer || ''
    });
  });
})();

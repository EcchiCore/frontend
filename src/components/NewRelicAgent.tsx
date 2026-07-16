"use client";

import { useEffect } from 'react';

export default function NewRelicAgent() {
  useEffect(() => {
    // Only load in the browser environment
    import('@newrelic/browser-agent/loaders/browser-agent')
      .then(({ BrowserAgent }) => {
        const options = {
          "info": {
            "applicationID": 1120550938,
            "beacon": "bam.nr-data.net",
            "errorBeacon": "bam.nr-data.net",
            "licenseKey": "NRJS-2f5b6d29dab2a5fef92",
            "sa": 1
          },
          "init": {
            "ajax": {
              "deny_list": [
                "bam.nr-data.net"
              ]
            },
            "browser_consent_mode": {
              "enabled": false
            },
            "distributed_tracing": {
              "enabled": true
            },
            "performance": {
              "capture_detail": false,
              "capture_marks": false,
              "capture_measures": true
            },
            "privacy": {
              "cookies_enabled": true
            }
          },
          "loader_config": {
            "accountID": 4653270,
            "agentID": 1120550938,
            "applicationID": 1120550938,
            "licenseKey": "NRJS-2f5b6d29dab2a5fef92",
            "trustKey": 4653270
          }
        };

        // The agent loader code executes immediately on instantiation.
        new BrowserAgent(options as any);
      })
      .catch((error) => {
        console.error('Failed to initialize New Relic Browser Agent:', error);
      });
  }, []);

  return null;
}

// All notifications in this app are local — the aps-environment (remote push)
// entitlement expo-notifications adds is unused, and free personal Apple
// developer teams cannot provision it. Strip it so on-device dev builds sign.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = (config) =>
  withEntitlementsPlist(config, (c) => {
    delete c.modResults['aps-environment'];
    return c;
  });

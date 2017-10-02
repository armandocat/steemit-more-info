
// default config
var config = {
  "transport": "ws",
  "websocket": "wss://steemd.steemit.com",
  "uri": "https://steemd.steemit.com",
  "url": "",
  "dev_uri": "https://steemd.steemitdev.com",
  "stage_uri": "https://steemd.steemitstage.com",
  "address_prefix": "STM",
  "chain_id": "0000000000000000000000000000000000000000000000000000000000000000"
};

// config.websocket = "wss://steemd-int.steemit.com";
// config.uri = "https://steemd-int.steemit.com";

// config.websocket = "wss://this.piston.rocks";
// config.uri = "https://this.piston.rocks";

config.websocket = "wss://gtg.steem.house:8090";
config.uri = "https://gtg.steem.house:8090";

var api2 = new steem.api.Steem(config);

steem.api = api2;


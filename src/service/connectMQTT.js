import { Client } from "paho-mqtt";

const connectMQTT = (topics, onMessage) => {
  const client = new Client(
    "test.mosquitto.org",
    Number(8081),
    `clientId-${Math.random() * 1000}`
  );
  let connected = false;

  client.onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.log(`onConnectionLost: ${responseObject.errorMessage}`);
    }
    connected = false;
  };

  client.onMessageArrived = (message) => {
    // console.log(`onMessageArrived: ${message.payloadString}`);
    onMessage(message.destinationName, message.payloadString);
  };

  client.connect({
    onSuccess: () => {
      console.log("Connected to MQTT broker");
      connected = true;
      // Subscribe to all provided topics
      topics.forEach((item) => {
        client.subscribe(`${item.topic}/sensor`);
      });
    },
    onFailure: (error) => {
      console.error(`Connection failed: ${error.errorMessage}`);
    },
    useSSL: true,
  });

  // Method to check if the client is connected
  client.isConnected = () => connected;

  return client;
};

export default connectMQTT;

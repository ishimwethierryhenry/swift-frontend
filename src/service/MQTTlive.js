// src/mqttService.js
import { Client } from "paho-mqtt";
import { throttle } from "lodash";

// Throttle interval in milliseconds
const THROTTLE_INTERVAL = 15000;

const MQTTlive = (topic, onMessage) => {
  // Create a client instance
  const client = new Client(
    "test.mosquitto.org",
    Number(8081),
    `clientId-${Math.random() * 1000}`
  );

  // Set callback handlers
  client.onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.log(`onConnectionLost: ${responseObject.errorMessage}`);
    }
  };

  // Throttled message handler
  const throttledOnMessage = throttle((destinationName, payloadString) => {
    onMessage(destinationName, payloadString);
  }, THROTTLE_INTERVAL);

  client.onMessageArrived = (message) => {
    // Call the throttled onMessage callback with the received message
    throttledOnMessage(message.destinationName, message.payloadString);
  };

  // Connect the client
  client.connect({
    onSuccess: () => {
      console.log("Connected to MQTT broker");
      // Once a connection has been made, make a subscription
      client.subscribe(`${topic}/sensor`);
    },
    onFailure: (error) => {
      console.error(`Connection failed: ${error.errorMessage}`);
    },
    useSSL: true, // Use SSL for secure connection
  });

  return client;
};

export default MQTTlive;

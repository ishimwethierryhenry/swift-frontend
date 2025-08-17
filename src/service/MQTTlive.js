// Enhanced MQTTlive.js with better debugging and connection handling
import { Client } from "paho-mqtt";
import { throttle } from "lodash";

// Reduced throttle for better responsiveness - your device publishes every 5 seconds
const THROTTLE_INTERVAL = 3000; // 3 seconds instead of 15

const MQTTlive = (topic, onMessage) => {
  console.log(`🚀 Starting MQTT connection for topic: ${topic}`);
  
  // Create a client instance with better client ID
  const clientId = `poolMonitor-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
  
  const client = new Client(
    "test.mosquitto.org",
    Number(8081),
    clientId
  );

  let isConnected = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  // Set callback handlers
  client.onConnectionLost = (responseObject) => {
    isConnected = false;
    if (responseObject.errorCode !== 0) {
      console.log(`❌ MQTT Connection Lost: ${responseObject.errorMessage}`);
      console.log(`🔄 Will attempt to reconnect...`);
    }
  };

  // Enhanced throttled message handler with detailed logging
  const throttledOnMessage = throttle((destinationName, payloadString) => {
    console.log(`📨 Processing message from ${destinationName}`);
    console.log(`📊 Message content: ${payloadString}`);
    
    try {
      // Validate JSON before passing to callback
      const testParse = JSON.parse(payloadString);
      if (testParse.ph !== undefined || testParse.tds !== undefined || testParse.tbdt !== undefined) {
        onMessage(destinationName, payloadString);
        console.log(`✅ Message successfully processed and sent to callback`);
      } else {
        console.warn(`⚠️ Message missing expected sensor data fields:`, testParse);
      }
    } catch (error) {
      console.error(`❌ Invalid JSON in MQTT message:`, error);
      console.error(`Raw message:`, payloadString);
    }
  }, THROTTLE_INTERVAL);

  client.onMessageArrived = (message) => {
    console.log(`📡 Raw MQTT message arrived:`);
    console.log(`  Topic: ${message.destinationName}`);
    console.log(`  Payload: ${message.payloadString}`);
    console.log(`  QoS: ${message.qos}`);
    console.log(`  Retained: ${message.retained}`);
    
    // Call the throttled onMessage callback
    throttledOnMessage(message.destinationName, message.payloadString);
  };

  // Enhanced connect function
  const connectToMQTT = () => {
    console.log(`🔌 Attempting MQTT connection to test.mosquitto.org:8081`);
    console.log(`🆔 Client ID: ${clientId}`);
    
    client.connect({
      timeout: 30,
      keepAliveInterval: 60,
      cleanSession: true,
      useSSL: true,
      onSuccess: () => {
        console.log("✅ Successfully connected to MQTT broker!");
        isConnected = true;
        reconnectAttempts = 0;
        
        // Subscribe to the sensor topic
        const fullTopic = `${topic}/sensor`;
        console.log(`🔔 Subscribing to topic: ${fullTopic}`);
        
        client.subscribe(fullTopic, {
          qos: 0,
          onSuccess: () => {
            console.log(`✅ Successfully subscribed to ${fullTopic}`);
            console.log(`🎯 Waiting for messages from your ESP8266 device...`);
          },
          onFailure: (error) => {
            console.error(`❌ Failed to subscribe to ${fullTopic}:`, error);
          }
        });
      },
      onFailure: (error) => {
        console.error(`❌ MQTT Connection failed:`, error);
        console.error(`Error code: ${error.errorCode}`);
        console.error(`Error message: ${error.errorMessage}`);
        isConnected = false;
        
        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`🔄 Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts} in 5 seconds...`);
          setTimeout(() => {
            connectToMQTT();
          }, 5000);
        } else {
          console.error(`❌ Max reconnection attempts reached. Please check your connection.`);
        }
      }
    });
  };

  // Start the connection
  connectToMQTT();

  // Add utility methods to client
  client.isConnected = () => isConnected;
  client.getClientId = () => clientId;
  client.reconnect = () => {
    if (!isConnected) {
      reconnectAttempts = 0;
      connectToMQTT();
    }
  };

  // Enhanced disconnect method
  const originalDisconnect = client.disconnect.bind(client);
  client.disconnect = () => {
    console.log(`🔌 Disconnecting MQTT client ${clientId}`);
    isConnected = false;
    originalDisconnect();
  };

};

export default MQTTlive;
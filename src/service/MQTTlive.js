// ARDUINO-COMPATIBLE MQTTlive.js
import { Client } from "paho-mqtt";

const MQTTlive = (topic, onMessage) => {
  console.log(`🚀 Connecting to match Arduino device on test.mosquitto.org:1883`);
  
  const clientId = `poolDashboard-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
  
  let client;
  let isConnected = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 8;
  let reconnectTimer;
  let currentBrokerIndex = 0;

  // ARDUINO-COMPATIBLE brokers - matching your device's configuration
  const brokers = [
    // Primary: Same as Arduino - test.mosquitto.org via WebSocket bridge
    // { 
    //   host: "localhost", 
    //   port: 8883,         // Changed from 8080 to 8883
    //   useSSL: false, 
    //   name: "Local MQTT Broker" 
    // },
    // { 
    //   host: "test.mosquitto.org", 
    //   port: 8080,                   // WebSocket port that bridges to 1883
    //   useSSL: false, 
    //   name: "Mosquitto WS Bridge",
    //   priority: 1 
    // },
    // { 
    //   host: "test.mosquitto.org", 
    //   port: 8081, 
    //   useSSL: true, 
    //   name: "Mosquitto WSS Bridge",
    //   priority: 2 
    // },
    
    // // Backup brokers (your device won't be on these, but good for testing)
    // { 
    //   host: "broker.hivemq.com", 
    //   port: 8000, 
    //   useSSL: false, 
    //   name: "HiveMQ WS Backup",
    //   priority: 3 
    // },
    { 
      host: "broker.hivemq.com", 
      port: 8884, 
      useSSL: true, 
      name: "HiveMQ WSS Backup",
      priority: 4 
    }
  ];

  const connectToMQTT = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error(`❌ All connection attempts failed. Device may be offline.`);
      return;
    }

    const broker = brokers[currentBrokerIndex % brokers.length];
    console.log(`🔌 Attempt ${reconnectAttempts + 1} - ${broker.name} (${broker.host}:${broker.port})`);
    
    try {
      client = new Client(broker.host, broker.port, clientId);

      // Longer timeout for test.mosquitto.org (it can be slow)
      client.connectTimeout = 20;
      
      client.onConnectionLost = (responseObject) => {
        isConnected = false;
        console.log(`❌ Lost connection to ${broker.name}: ${responseObject.errorMessage}`);
        
        currentBrokerIndex++;
        reconnectAttempts++;
        
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = broker.priority === 1 ? 3000 : 1000; // Longer retry for primary
          console.log(`🔄 Trying next broker in ${delay/1000}s...`);
          reconnectTimer = setTimeout(() => connectToMQTT(), delay);
        }
      };

      client.onMessageArrived = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        
        console.log(`📡 *** MQTT MESSAGE RECEIVED ***`);
        console.log(`⏰ Time: ${timestamp}`);
        console.log(`🏢 Broker: ${broker.name}`);
        console.log(`📍 Topic: ${message.destinationName}`);
        console.log(`📝 Payload: ${message.payloadString}`);
        
        // Highlight messages from your Arduino device
        if (message.destinationName === "device_serena_pool02/sensor") {
          console.log(`🎯 *** CONFIRMED: MESSAGE FROM YOUR ARDUINO DEVICE! ***`);
        }
        
        try {
          const data = JSON.parse(message.payloadString);
          console.log(`📊 Parsed JSON data:`, data);
          
          // Check for your Arduino's specific data structure
          if (data.hasOwnProperty('tds') && data.hasOwnProperty('tbdt') && data.hasOwnProperty('ph')) {
            console.log(`✅ PERFECT MATCH: Arduino sensor data detected!`);
            console.log(`   TDS: ${data.tds} ppm`);
            console.log(`   Turbidity: ${data.tbdt} NTU`);  
            console.log(`   pH: ${data.ph}`);
            console.log(`🔥 Calling dashboard callback...`);
            
            onMessage(message.destinationName, message.payloadString);
          } else {
            console.log(`ℹ️ Message has different structure:`, Object.keys(data));
          }
        } catch (error) {
          console.log(`⚠️ Non-JSON message:`, message.payloadString);
        }
      };

      const connectOptions = {
        timeout: 20,                 // Longer timeout for test.mosquitto.org
        keepAliveInterval: 60,       // Match Arduino's expectations
        cleanSession: true,
        useSSL: broker.useSSL,
        
        onSuccess: () => {
          console.log(`✅ CONNECTED to ${broker.name}!`);
          console.log(`🎯 This broker should be able to receive data from your Arduino`);
          isConnected = true;
          reconnectAttempts = 0;
          
          // Subscribe to your Arduino's exact topic
          const deviceTopic = "device_serena_pool02/sensor";
          console.log(`🔔 Subscribing to Arduino topic: ${deviceTopic}`);
          
          client.subscribe(deviceTopic, {
            qos: 0, // Match Arduino's QoS
            onSuccess: () => {
              console.log(`✅ Subscribed to ${deviceTopic} on ${broker.name}`);
              console.log(`📡 Listening for your Arduino device...`);
              console.log(`💡 If Arduino is connected to test.mosquitto.org:1883, you should see data!`);
            },
            onFailure: (error) => {
              console.error(`❌ Subscribe failed:`, error);
            }
          });
        },
        
        onFailure: (error) => {
          console.error(`❌ FAILED to connect to ${broker.name}`);
          console.error(`   Error: ${error.errorMessage} (Code: ${error.errorCode})`);
          
          if (broker.priority === 1) {
            console.log(`⚠️ Primary broker (matching Arduino) failed!`);
            console.log(`   This suggests network issues with test.mosquitto.org`);
          }
          
          isConnected = false;
          currentBrokerIndex++;
          reconnectAttempts++;
          
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = 3000;
            console.log(`🔄 Trying next broker in ${delay/1000}s...`);
            reconnectTimer = setTimeout(() => connectToMQTT(), delay);
          }
        }
      };

      console.log(`⏱️ Connecting to ${broker.name} (timeout: ${connectOptions.timeout}s)...`);
      client.connect(connectOptions);
      
    } catch (error) {
      console.error(`❌ Setup error for ${broker.name}:`, error);
      currentBrokerIndex++;
      reconnectAttempts++;
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectTimer = setTimeout(() => connectToMQTT(), 2000);
      }
    }
  };

  // Start connection
  connectToMQTT();

  return {
    disconnect: () => {
      console.log(`🔌 Disconnecting from MQTT`);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (client && isConnected) {
        isConnected = false;
        client.disconnect();
      }
    },
    
    isConnected: () => isConnected,
    getClientId: () => clientId,
    getCurrentBroker: () => brokers[currentBrokerIndex % brokers.length],
    
    // Enhanced status for debugging
    getStatus: () => ({
      connected: isConnected,
      attempts: reconnectAttempts,
      currentBroker: brokers[currentBrokerIndex % brokers.length],
      arduinoCompatible: currentBrokerIndex < 2 // First 2 brokers are Arduino-compatible
    })
  };
};

export default MQTTlive;
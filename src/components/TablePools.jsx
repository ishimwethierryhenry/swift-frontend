import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import connectMQTT from "../service/connectMQTT";
import { useNavigate } from "react-router-dom";

export const TablePools = ({ onEdit, onDelete, role, pools }) => {
  const [DEVICE_TOPICS, setDEVICE_TOPICS] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState({});
  const [mqttClient, setMqttClient] = useState(null);
  const [online, setOnline] = useState(0);

  const navigation = useNavigate();

  const CHECK_INTERVAL = 2000; // 10 seconds

  const getTopic = (name) => {
    for (const item of DEVICE_TOPICS) {
      if (item.device === name) {
        return item.topic;
      }
    }
  };

  const handleEdit = ({ id, data }) => {
    onEdit({ open: true, id, data });
  };

  const handleDelete = (id) => {
    onDelete({ open: true, id });
  };

  const slugify = (str) => {
    return str.trim().toLowerCase().split(" ").join("_");
  };

  useEffect(() => {
    if (DEVICE_TOPICS.length > 0) {
      const initialStatus = {};
      DEVICE_TOPICS.forEach((item) => {
        initialStatus[item.topic] = { online: false, lastMessage: Date.now() };
      });
      setDeviceStatus(initialStatus);

      const client = connectMQTT(DEVICE_TOPICS, (topic, message) => {
        // console.log(`Received message: ${message} on topic: ${topic}`);
        setDeviceStatus((prevStatus) => ({
          ...prevStatus,
          [topic]: { online: true, lastMessage: Date.now() },
        }));
      });

      setMqttClient(client);

      // Check for device status periodically
      const interval = setInterval(() => {
        setDeviceStatus((prevStatus) => {
          const updatedStatus = { ...prevStatus };
          const now = Date.now();
          DEVICE_TOPICS.forEach((item) => {
            if (
              now - updatedStatus[`${item.topic}/sensor`]?.lastMessage >
              CHECK_INTERVAL
            ) {
              updatedStatus[`${item.topic}/sensor`].online = false;
            }
          });
          return updatedStatus;
        });
      }, CHECK_INTERVAL);

      return () => {
        if (client && client.isConnected()) {
          client.disconnect();
        }
        clearInterval(interval);
      };
    }
  }, [DEVICE_TOPICS]);

  useEffect(() => {
    const makeTopics = () => {
      let topic = "";
      let allTopics = [];
      for (const pool of pools) {
        topic = slugify(`device ${pool.location} ${pool.name}`);
        allTopics.push({ device: pool.name, topic });

        setDEVICE_TOPICS(allTopics);
      }
    };

    if (pools.length > 0) {
      makeTopics();
    }
  }, [pools]);
  return (
    <div className="flex flex-col mt-4">
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden ">
            <table className="min-w-full divide-y divide-gray-200 table-fixed ">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase"
                  >
                    Depth
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase"
                  >
                    Length
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase"
                  >
                    Width
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pools.map((pool) => (
                  <tr key={pool.id} className="hover:bg-gray-100">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap ">
                      {pool.name}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {pool.depth}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {pool.l}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {pool.w}
                    </td>
                    <td className="flex flex-row gap-1 py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {deviceStatus[
                        slugify(`device ${pool.location} ${pool.name}`) +
                          "/sensor"
                      ]?.online ? (
                        <label className=" text-sm bg-green-400 px-[2px] rounded-md">
                          Online
                        </label>
                      ) : (
                        <label className=" text-sm bg-red-400 px-[2px] rounded-md">
                          Offline
                        </label>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                      <a
                        href={
                          deviceStatus[
                            slugify(`device ${pool.location} ${pool.name}`) +
                              "/sensor"
                          ]?.online
                            ? "/pool/data/" +
                              slugify(`device ${pool.location} ${pool.name}`)
                            : "#"
                        }
                        className={`text-gray-600 mx-[0.7px] px-1 rounded-md ${
                          deviceStatus[
                            slugify(`device ${pool.location} ${pool.name}`) +
                              "/sensor"
                          ]?.online
                            ? "bg-green-400"
                            : "bg-gray-400 opacity-45"
                        } hover:underline`}
                      >
                        View
                      </a>
                      {role === "admin" && (
                        <>
                          <a
                            href="#"
                            onClick={() =>
                              handleEdit({ id: pool.id, data: pool })
                            }
                            className="text-gray-600 px-1 mx-[0.7px] rounded-md bg-yellow-400 hover:underline"
                          >
                            Edit
                          </a>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
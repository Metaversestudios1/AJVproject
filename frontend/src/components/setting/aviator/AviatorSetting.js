import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoIosArrowRoundBack } from "react-icons/io";
import $ from "jquery";
import "jquery-validation";
const AviatorSetting = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);
  const initialState = {
    gameStatus: "",
    minBetAmount: 0,
    maxBetAmount: 0,
    initialBonus: 0,
    minRecharge: 0,
    minWithdraw: 0,
    startGameRangeTimer: 0,
    endGameRangeTimer: 0,
    gameStartTime: "",
    gameBetweenEndTime: "",
    level1Commission: 0,
    level2Commission: 0,
    level3Commission: 0,
  };

  const [data, setData] = useState(initialState);
  useEffect(() => {
    fetchOldData();
  }, []);
  const fetchOldData = async () => {
    const res = await fetch(`http://localhost:8000/api/getAllSetting`);
    const response = await res.json();
    if (response.success) {
      setData({
        ...data,
        gameStatus: response.result[0].gameStatus,
        minBetAmount: response.result[0].minBetAmount,
        maxBetAmount: response.result[0].maxBetAmount,
        initialBonus: response.result[0].initialBonus,
        minRecharge: response.result[0].minRecharge,
        minWithdraw: response.result[0].minWithdraw,
        startGameRangeTimer: response.result[0].startGameRangeTimer,
        endGameRangeTimer: response.result[0].endGameRangeTimer,
        gameStartTime: response.result[0].gameStartTime.split("T")[0],
        gameBetweenEndTime: response.result[0].gameBetweenEndTime,
        level1Commission: response.result[0].level1Commission,
        level2Commission: response.result[0].level2Commission,
        level3Commission: response.result[0].level3Commission,
      });
      setLoader(false);
    }
  };
  const validateSettingForm = () => {
    $("#settingform").validate({
      rules: {
        gameStatus: { required: true },
        // minBetAmount: { required: true },
        // maxBetAmount: { required: true },
        // initialBonus: { required: true },
        // minRecharge: { required: true },
        // minWithdraw: { required: true },
        // startGameRangeTimer: { required: true },
        // endGameRangeTimer: { required: true },
        // gameStartTime: { required: true },
        // gameBetweenEndTime: { required: true },
        // level1Commission: { required: true },
        // level2Commission: { required: true },
        // level3Commission: { required: true },
      },
      messages: {
        gameStatus: { required: "Please enter game status" },
        minBetAmount: { required: "Please enter min bet amount" },
        maxBetAmount: { required: "Please enter max bet amount" },
        initialBonus: { required: "Please enter initial bonus" },
        minRecharge: { required: "Please enter min recharge amount" },
        minWithdraw: { required: "Please enter min withdraw amount" },
        startGameRangeTimer: { required: "Please enter start game range time" },
        endGameRangeTimer: { required: "Please enter end game range time" },
        gameStartTime: { required: "Please enter game start time" },
        gameBetweenEndTime: { required: "Please enter game between time" },
        level1Commission: { required: "Please enter level 1 commission" },
        level2Commission: { required: "Please enter level 2 commision" },
        level3Commission: { required: "Please enter level 3 commision" },
      },
    });
    return $("#settingform").valid();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSettingForm()) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/updatesetting`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const response = await res.json();
      if (response.success) {
        toast.success("Setting updated Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setTimeout(() => {
          navigate(0);
        }, 1500);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };
  return (
    <div className="relative">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex items-center">
        <IoIosArrowRoundBack
          onClick={() => navigate(-1)}
          className="bg-[#0472ff] rounded-full hover:scale-110 transition-all text-white text-[40px] cursor-pointer ml-5"
        />
        <div className="text-2xl font-bold mx-2 my-8 px-2">Aviator setting</div>
      </div>
      {loader ? (
        <div className="absolute w-[100%] h-[40%] flex justify-center items-center">
          <div
            className=" flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] "
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center w-[70%] m-auto">
          <form id="settingform" className="w-[60%]">
            <div className="my-4 relative">
              <label
                htmlFor="gameStatus"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Game status
              </label>
              <select
               type="text"
               name="gameStatus"
               id="gameStatus"
               value={data.gameStatus}
               onChange={handleChange}
               className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
               placeholder="Enter game status"
              >
                <option value="0">Inactive</option>
                <option value="1">Active</option>
              </select>
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="minBetAmount"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Min Bet Amount
              </label>
              <input
                type="text"
                name="minBetAmount"
                id="minBetAmount"
                value={data.minBetAmount}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Min Bet Amount"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="maxBetAmount"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Max Bet Amount
              </label>
              <input
                type="text"
                name="maxBetAmount"
                id="maxBetAmount"
                value={data.maxBetAmount}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Max Bet Amount"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="initialBonus"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Initial Bonus
              </label>
              <input
                type="text"
                name="initialBonus"
                id="initialBonus"
                value={data.initialBonus}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Initial Bonus"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="minRecharge"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Min Recharge
              </label>
              <input
                type="text"
                name="minRecharge"
                id="minRecharge"
                value={data.minRecharge}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Min Recharge"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="minWithdraw"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Min Withdraw
              </label>
              <input
                type="text"
                name="minWithdraw"
                id="minWithdraw"
                value={data.minWithdraw}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Min Withdraw"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="startGameRangeTimer"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Start Game Range Timer
              </label>
              <input
                type="text"
                name="startGameRangeTimer"
                id="startGameRangeTimer"
                value={data.startGameRangeTimer}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Start Game Range Timer"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="endGameRangeTimer"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                End Game Range Timer
              </label>
              <input
                type="text"
                name="endGameRangeTimer"
                id="endGameRangeTimer"
                value={data.endGameRangeTimer}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter End Game Range Timer"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="gameStartTime"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Game Start Time
              </label>
              <input
                type="date"
                name="gameStartTime"
                id="gameStartTime"
                value={data.gameStartTime}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Game Start Time"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="gameBetweenEndTime"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Game Between Time
              </label>
              <input
                type="date"
                name="gameBetweenEndTime"
                id="gameBetweenEndTime"
                value={data.gameBetweenEndTime}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Game Between Time"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="level1Commission"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Level1 Commission
              </label>
              <input
                type="text"
                name="level1Commission"
                id="level1Commission"
                value={data.level1Commission}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Level1 Commision"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="level2Commission"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Level2 Commission
              </label>
              <input
                type="text"
                name="level2Commission"
                id="level2Commission"
                value={data.level2Commission}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Level2 Commision"
              />
            </div>
            <div className="my-4 relative">
              <label
                htmlFor="level3Commission"
                className="block mb-2 text-lg font-medium text-gray-900 dark:text-black"
              >
                Level3 Commission
              </label>
              <input
                type="text"
                name="level3Commission"
                id="level3Commission"
                value={data.level3Commission}
                onChange={handleChange}
                className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                placeholder="Enter Level3 Commision"
              />
            </div>
            <button
              type="submit"
              className="text-white bg-[#0472ff] hover:bg-blue-800 font-medium rounded-lg px-5 py-2.5"
              onClick={handleSubmit}
            >
              Save changes
            </button>
          </form>
        </div>
      )}
     
    </div>
  );
};

export default AviatorSetting;

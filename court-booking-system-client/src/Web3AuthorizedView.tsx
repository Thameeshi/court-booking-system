import React, {useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import XrplService from "./services/common-services/XrplService.ts";
import { setXrplAccount, setXrpBalance } from "./store/slices/walletSlice";
import { logout as logoutAction } from "./store/slices/authSlice";
//import HotPocketService from "./services/HotPocketService.js"
//import { setIsContractInitiated} from "./store/slices/hotPocketSlice.js";

const Web3AuthorizedView = () => {
  const dispatch = useDispatch();
  const { provider } = useSelector((state: any) => state.auth);
  const { web3auth } = useSelector((state: any) => state.auth);

  // useEffect(() => {
  //   console.log("Web3AuthorizedView useEffect initiating HP.");
  //   HotPocketService.instance.init().then(() => {
  //     setIsContractInitiated(true);
  //   });
  // })

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("provider not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("provider not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new XrplService(provider);
    const userAccount = await rpc.getAccounts();
    dispatch(setXrplAccount(userAccount["account_data"]));
    uiConsole("Account info: ", userAccount);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new XrplService(provider);
    const balance = await rpc.getBalance();
    dispatch(setXrpBalance(balance));
    uiConsole("Balance", balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new XrplService(provider);
    const result = await rpc.signAndSendTransaction(50, "rEftBztcdRr4o8KA7ZppRuePM2q466AJvf");
    uiConsole(result);
  };

  const mintNFT = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new XrplService(provider);
    const result = await rpc.mintNFT("memo test1", "https://test.com");
    uiConsole(result);
  };

  const burnNFT = async (nfTokenId: string) => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new XrplService(provider);
    const result = await rpc.burnNFT(nfTokenId);
    uiConsole(result);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new XrplService(provider);
    const result = await rpc.signMessage();
    uiConsole(result);
  };

  const uiConsole = (...args: any[]): void => {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  };

  const handleLogout = async () => {
    if (!web3auth) {
      console.error("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    dispatch(logoutAction());
    
  }

  return (
    <>
      <div className="flex-container flex-row">
        <div>
          <button onClick={getUserInfo} className="button">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="button">
            Get ID Token
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="button">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="button">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="button">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="button">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={mintNFT} className="button">
            Mint NFT
          </button>
        </div>
        <div>
          <button onClick={() => burnNFT("0000000029931A2068DC9CB5F4C56F742458CD63B43CC83764D07D930042FBF8")} className="button">
            Burn NFT
          </button>
        </div>
        <div>
          <button onClick={handleLogout} className="button" >
            Log Out
          </button>
        </div>
      </div>
      <div id="console" style={{ whiteSpace: "pre-line" }} className="card">
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </>
  );
};

export default Web3AuthorizedView;
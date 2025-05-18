import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, UX_MODE, WEB3AUTH_NETWORK } from "@web3auth/base";
import { AuthAdapter } from "@web3auth/auth-adapter";
import { XrplPrivateKeyProvider } from "@web3auth/xrpl-provider";
import { setWeb3auth, setProvider, setWeb3Authorized, setLoading, setUserInfo } from "../store/slices/authSlice";
import XrplService from "../services/common-services/XrplService.ts";
import { setXrpBalance, setXrplAccount } from "../store/slices/walletSlice";
import "./Web3AuthPage.css";

const clientId = process.env.WEB3AUTH_CLIENT_ID || "";

const Web3AuthPage = () => {
  const dispatch = useDispatch();
  const { web3auth, loading } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const chainConfig = {
      chainNamespace: CHAIN_NAMESPACES.XRPL,
      chainId: "0x2",
      rpcTarget: "https://testnet-ripple-node.tor.us",
      wsTarget: "wss://s.altnet.rippletest.net",
      ticker: "XRP",
      tickerName: "XRPL",
      displayName: "xrpl testnet",
      blockExplorerUrl: "https://testnet.xrpl.org",
    };

    const init = async () => {
      try {
        dispatch(setLoading(true));

        const xrplProvider = new XrplPrivateKeyProvider({
          config: {
            chainConfig: chainConfig,
          },
        });

        const web3auth = new Web3Auth({
          clientId,
          uiConfig: {
            appName: "W3A",
            theme: {
              primary: "red",
            },
            mode: "dark",
            logoLight: "https://web3auth.io/images/web3authlog.png",
            logoDark: "https://web3auth.io/images/web3authlogodark.png",
            defaultLanguage: "en",
            loginGridCol: 3,
            primaryButton: "externalLogin",
            uxMode: UX_MODE.REDIRECT,
          },
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider: xrplProvider,
        });

        const authAdapter = new AuthAdapter({
          loginSettings: {
            mfaLevel: "none",
          },
          adapterSettings: {
            mfaSettings: {
              deviceShareFactor: {
                enable: true,
                priority: 1,
                mandatory: true,
              },
              backUpShareFactor: {
                enable: true,
                priority: 2,
                mandatory: false,
              },
              socialBackupFactor: {
                enable: true,
                priority: 3,
                mandatory: false,
              },
              passwordFactor: {
                enable: true,
                priority: 4,
                mandatory: true,
              },
            },
          },
        });
        web3auth.configureAdapter(authAdapter);

        dispatch(setWeb3auth(web3auth));

        await web3auth.initModal();

        if (web3auth.connected) {
          const userInfo = await web3auth.getUserInfo();
          dispatch(setUserInfo(userInfo));

          if (web3auth.provider) {
            dispatch(setProvider(web3auth.provider));
            const xrplService = new XrplService(web3auth.provider);
            const userAccount = await xrplService.getAccounts();
            dispatch(setXrplAccount(userAccount["account_data"]));
            const accBalance = await xrplService.getBalance();
            dispatch(setXrpBalance(accBalance));
            console.log("setting web3auth authorized", true);
            dispatch(setWeb3Authorized(true));

          } else {
            console.error("web3auth provider is null");
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    init();
  }, [dispatch]);

  const web3authorize = async () => {
    try {
      if (!web3auth) {
        console.error("web3authorize error. web3auth not initialized yet.");
        return;
      }
      const web3authProvider = await web3auth.connect();
      dispatch(setProvider(web3authProvider));
      dispatch(setWeb3Authorized(true));
    } catch (error) {
      console.error("web3authorize error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div>
      <div className="login-page"
        style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + '/greencourt.jpg'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        width: '100vw',
      }}
      >
      <div className="login-container"
        style={{
        display: "flex",
        justifyContent: "center",     // centers horizontally
        alignItems: "center",         // centers vertically
        height: "100vh",              // full screen height
        flexWrap: "wrap",             
        }}>
      <div
        style={{
        display: "flex",
        flexDirection: "column", // stack boxes vertically
        alignItems: "center",
        //boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
        borderRadius: "15px",
        overflow: "hidden",
        }}
      >
      <div className="login-boxup"
        style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + '/greencourt.jpg'})`,
        padding: "40px",
        boxShadow: "0 8px 20px rgba(0, 1, 0, 1)",
        width: "450px",
        height: "260px",
        maxWidth: "90%",
        textAlign: "center",
        backgroundPosition: 'center',
        }}>
        
        <h5>Welcome to Courtify</h5>
        <p>Book your favorite sports court anytime, anywhere. 
          Hassle-free reservations at your fingertips!</p>
      </div>
      <div className="login-box"
        style={{
        background: "rgba(180, 235, 192, 0.85)",
        backdropFilter: "blur(5px)", // gives glassmorphism blur effect
        padding: "10px",
        boxShadow: "0 8px 20px rgba(0, 1, 1, 1)",
        width: "450px",
        height: "260px",
        maxWidth: "90%",
        textAlign: "center",
        backgroundPosition: 'center',
        }}>

        <h2>Login</h2>
        <img
          src={`${process.env.PUBLIC_URL}/logo.png`}
          alt="Logo"
          style={{
          width: "30%",        // adjust size as needed
          //marginTop: "10px",
         marginBottom: "20px",
         
  }}
/>
      
      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <button className="login-button" 
        onClick={web3authorize} >
           log in
        </button>
      )}
    </div>
    </div>
    </div>
    </div>
    </div>
    
  );
};

export default Web3AuthPage;
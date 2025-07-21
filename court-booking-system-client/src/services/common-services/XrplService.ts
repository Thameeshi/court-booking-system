import { IProvider } from "@web3auth/base";
import { convertStringToHex, NFTokenBurn, NFTokenMint, NFTokenCreateOffer, Payment, xrpToDrops, NFTokenAcceptOffer, } from "xrpl";

export default class XrplService {
  private provider: IProvider;

  constructor(provider: IProvider) {
    this.provider = provider;
  }

async getTransaction(txHash: string): Promise<any> {
  try {
    const tx = await this.provider.request({
      method: "tx",
      params: [{
        transaction: txHash,
        binary: false
      }]
    });
    return tx;
  } catch (error) {
    console.error("Error in getTransaction:", error);
    return error;
  }
}

async waitForConfirmation(txHash: string, timeout = 30000): Promise<any> {
  console.log("Waiting for transaction confirmation...");
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const tx = await this.getTransaction(txHash);
    console.log("tx:", tx);
    if (tx?.validated) {
      return tx;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error("Transaction confirmation timeout");
}

  getAccounts = async (): Promise<any> => {
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });
      if (accounts) {
        const accInfo = await this.provider.request({
          method: "account_info",
          params: [
            {
              account: accounts[0],
              strict: true,
              ledger_index: "current",
              queue: true,
            },
          ],
        });
        return accInfo;
      } else {
        return "No accounts found, please report this issue.";
      }
    } catch (error) {
      console.error("Error", error);
      return error;
    }
  };

  getAllNfts = async (): Promise<any> => {
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });

      if (accounts && accounts.length > 0) {
        const nfts = await this.provider.request({
          method: "account_nfts",
          params: [
            {
              account: accounts[0],
              ledger_index: "current",
            },
          ],
        });
        return nfts;
      } else {
        return "No accounts found, please report this issue.";
      }
    } catch (error) {
      console.error("Error", error);
      return error;
    }
  };

  getNftFromUri = async (uri: string): Promise<any> => {
    try {

      const allNfts = await this.getAllNfts();
      const nfts = allNfts['account_nfts'];
      console.log("NFTs found in wallet:", nfts);
  
      if (Array.isArray(nfts)) {
        const foundNft = nfts.find((nft) => {
        const decodedUri = Buffer.from(nft.URI, "hex").toString("utf-8");
        console.log("🔍 Comparing decoded URI:", decodedUri, "with:", uri);
        return decodedUri === uri;
      });

  
        if (foundNft) {
          console.log("✅ NFT matched:", foundNft);
          return foundNft.NFTokenID;
        } else {
          console.error("Error in getNftFromUri. NFT not found");
          return null;
        }
      } else {
        console.error("Error in getNftFromUri. getAllNfts did not return an array");
        return null;
      }
    } catch (error) {
      console.error("Error in getNftFromUri:", error);
      return error;
    }
  };

  createSellOffer = async (tokenId: string, amount: number, memoData?: any, destination?: string): Promise<any> => {
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });

      if (!accounts || accounts.length === 0) {
        return "No accounts found, please report this issue.";
      }

      if (!tokenId) {
        return "Please provide the NFTokenID.";
      }

      if (!amount) {
        return "Please provide the offer amount.";
      }

      const sellOfferTx: NFTokenCreateOffer = {
        TransactionType: "NFTokenCreateOffer",
        Account: accounts[0] as string, // Seller's account
        NFTokenID: tokenId, // The NFTokenID of the NFT being sold
        Amount: xrpToDrops(amount), // Amount in XRP (converted to drops)
        Flags: 1, // Flag 1 indicates a sell offer
        Destination: destination, // Optional: Specify a destination account to restrict the offer to a specific buyer
        Memos: [{
          Memo: {
            MemoData: convertStringToHex(memoData)
          }
      }]
      };

      const txSign = await this.provider.request({
        method: "xrpl_submitTransaction",
        params: {
          transaction: sellOfferTx,
        },
      });

      return txSign;
    } catch (error) {
      console.error("Error in createSellOffer:", error);
      return error;
    }
  };

  acceptSellOffer = async (offerId: string): Promise<any> => {
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });

      if (!accounts || accounts.length === 0) {
        return "No accounts found, please report this issue.";
      }

      if (!offerId) {
        return "Please provide the Sell Offer ID.";
      }

      const buyOfferTx: NFTokenAcceptOffer = {
        TransactionType: "NFTokenAcceptOffer",
        Account: accounts[0] as string,
        NFTokenSellOffer: offerId,
      };

      const txSign = await this.provider.request({
        method: "xrpl_submitTransaction",
        params: {
          transaction: buyOfferTx,
        },
      });

      return txSign;
    } catch (error) {
      console.error("Error in acceptSellOffer:", error);
      return error;
    }
  };

  getBalance = async (): Promise<any> => {
    try {
      const accounts = await this.provider.request<string[], never>({
        method: "xrpl_getAccounts",
      });

      if (accounts) {
        const accInfo = (await this.provider.request({
          method: "account_info",
          params: [
            {
              account: accounts[0],
              strict: true,
              ledger_index: "current",
              queue: true,
            },
          ],
        })) as Record<string, Record<string, string>>;
        return accInfo.account_data?.Balance;
      } else {
        return "No accounts found, please report this issue.";
      }
    } catch (error) {
      console.error("Error", error);
      return error;
    }
  };

  signMessage = async (): Promise<any> => {
    try {
      const msg = "Hello world";
      const hexMsg = convertStringToHex(msg);
      const txSign = await this.provider.request< { signature: string }, never>({
        method: "xrpl_signMessage",
        params: {
          signature: hexMsg,
        },
      });
      return txSign;
    } catch (error) {
      console.log("error", error);
      return error;
    }
  };

  signAndSendTransaction = async (amount: number, destination: string): Promise<any> => {
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });

      if(!amount) {
        return "Please provide the transaction amount.";
      }

      if(!destination) {
        return "Please provide the transaction destination.";
      }

      if (accounts && accounts.length > 0) {
        const tx: Payment = {
          TransactionType: "Payment",
          Account: accounts[0] as string,
          Amount: xrpToDrops(amount),
          Destination: destination,
        };
        const txSign = await this.provider.request({
          method: "xrpl_submitTransaction",
          params: {
            transaction: tx,
          },
        });
        return txSign;
      } else {
        return "failed to fetch accounts";
      }
    } catch (error) {
      console.log("error", error);
      return error;
    }
  };

  mintNFT = async (memoData: any, uriData: any): Promise<any> => {
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });

      if (accounts && accounts.length > 0) {


        const mintTx: NFTokenMint = {
          TransactionType: "NFTokenMint",
          Account: accounts[0] as string,
          URI: convertStringToHex(uriData),
          NFTokenTaxon: 0,
          Memos: [{
            Memo: {
              MemoData: convertStringToHex(memoData)
            }
        }]
        };
        const txSign = await this.provider.request({
          method: "xrpl_submitTransaction",
          params: {
            transaction: mintTx,
          },
        });
        return txSign;
      } else {
        return "failed to fetch accounts";
      }
    } catch (error) {
      console.log("error", error);
      return error;
    }
  };

  burnNFT = async (tokenId: string): Promise<any> => {
    try {
      const accounts = await this.provider.request<never, string[]>({
        method: "xrpl_getAccounts",
      });

      if (accounts && accounts.length > 0) {


        const tx: NFTokenBurn = {
          TransactionType: "NFTokenBurn",
          Account: accounts[0] as string,
          NFTokenID: tokenId
        };
        const txSign = await this.provider.request({
          method: "xrpl_submitTransaction",
          params: {
            transaction: tx,
          },
        });
        return txSign;
      } else {
        return "failed to fetch accounts";
      }
    } catch (error) {
      console.log("error", error);
      return error;
    }
  };
}

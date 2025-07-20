class HotPocketService {
    constructor() {
        this.client = null;
        this.userKeyPair = null;
        this.pendingRequests = new Map();
        this.readQueue = Promise.resolve();
    }

    async initialize() {
        const HotPocket = window.HotPocket;
        const contractUrl = process.env.CONTRACT_WSS_ENDPOINT || "";

        this.userKeyPair = await HotPocket.generateKeys();
        console.log('My public key is: ' + Buffer.from(this.userKeyPair.publicKey).toString('hex'));
        console.log('My private key is: ' + Buffer.from(this.userKeyPair.privateKey).toString('hex'));
        this.client = await HotPocket.createClient([contractUrl], this.userKeyPair);

        if (!await this.client.connect()) {
            console.log('Connection failed.');
            return false;
        }

        console.log('HotPocket Connected.');

        this.client.on(HotPocket.events.contractOutput, (result) => {
            result.outputs.forEach((output) => {
                try {
                    const response = output;
                    if (output.reqId) {
                        const resolve = this.pendingRequests.get(response.reqId);
                        if (resolve) {
                            resolve(response);
                            this.pendingRequests.delete(output.reqId);
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse output:', e);
                }
            });
        });

        return true;
    }

    generateReqId() {
        return Math.random().toString(36).substr(2, 9);
    }

    async getServerInputResponse(request) {
        const reqId = this.generateReqId();
        request.reqId = reqId;

        console.log('Sending request:', request);

        // Handle FormData serialization
        if (request.data instanceof FormData) {
            const serializedData = {};
            const promises = [];

            request.data.forEach((value, key) => {
                if (value instanceof File) {
                    // Convert File to a base64 string
                    const promise = new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            serializedData[key] = reader.result; // Base64 string
                            resolve();
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(value);
                    });
                    promises.push(promise);
                } else {
                    serializedData[key] = value;
                }
            });

            // Wait for all file conversions to complete
            await Promise.all(promises);
            request.data = serializedData;
        }

        const responsePromise = new Promise((resolve) => {
            this.pendingRequests.set(reqId, resolve);
        });

        await this.client.submitContractInput(JSON.stringify(request));

        const response = await responsePromise;
        console.log('Received response:', response);
        return response;
    }

    async getServerReadReqResponse(readRequest) {
        const result = this.readQueue = this.readQueue.then(async () => {
            console.log('Sending readRequest:', readRequest);
            const response = await this.client.submitContractReadRequest(JSON.stringify(readRequest));
            console.log('Received readReq response:', response);
            return response;
        }).catch(error => {
            console.error('Error processing read request:', error);
            throw error;
        });

        return result;
    }
}

const hotPocketServiceInstance = new HotPocketService();
export default hotPocketServiceInstance;
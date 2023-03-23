const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");
const AEU = require("../../src/utils/AE_utils");
const AED = require("../../src/wallet/AE_data");
const fs = require("fs");
const AET = require("../../src/utils/AE_constants");
const AEB = require("../../src/utils/AE_blockchain_dummy");
const { userInfo } = require("os");


async function main() {

    // TO-DO - Executing more than once this test return NON VALID LOGIN
    console.log("AE11_service_provider_presentation_deletion STARTED");

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/test/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET

    // THIS IS DONE ONLY TO SIMULATE THE SELECTION OF A PRESENTATION TO DELETE
    console.log("AE11 - U - Presentation deletion -  User -\tCreate object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);



    console.log("AE11 - P - Presentation deletion -  Provider - Create object and load identity");
    let providerIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Provider_Identity_Wallet.json");
    let providerEpicWallet = new AEEW.AE_entityWallet();
    providerEpicWallet.readIdentityWallet(providerIdentityWalletJSON);


    /////////////////////////////////////////////////////
    // Simulate the selection of a presentation to delete
    console.log("AE11 - U - Presentation deletion -  User -\tTell the Service Provider the presentation to be deleted");
    let leafs = userEpicWallet.DTree.findAllLeafs();
    let presentations = leafs.filter(x => x.data.objectKind == AET.presentation);
    let presentationHash = presentations[0].data.objectID;
    commsD.SendTo("BlockchainNetwork","Rent_a_K","PresentationHASH",presentationHash);

    

    /////////////////////////////////////////////////////
    // Set Presentation status in Service Provider wallet
    let presentationToDelete = commsD.Receive("BlockchainNetwork","Rent_a_K","PresentationHASH");

    console.log("AE11 - U - User presentation revocation -  User -\tSet object status in wallet");    
    providerEpicWallet.setObjectStatus("JohnDoe",presentationToDelete,false);



    /////////////////////////////////////////////////////
    // Set in Blockchain presentation status to deleted
    console.log("AE11 - P - Presentation deletion -  Provider -\tMark the presentation as deleted in blockchain");
    AEB.DeleteBLK(presentationToDelete);

    
    /////////////////////////////////////////////////////
    // STORE IDENTITY WALLET

    console.log("AE11 - P - Presentation deletion -  Provider - \tStore identity wallet");
    AEWS.storeIdentityWallet(providerEpicWallet, storagePath + "/test_data/AE02_Provider_Identity_Wallet.json")

    console.log("AE11_service_provider_presentation_deletion FINISHED");

}

main();

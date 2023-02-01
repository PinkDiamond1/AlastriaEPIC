const AEUW = require("../../src/wallet/AE_wallet_user");
const AEEW = require("../../src/wallet/AE_wallet_entity");
const AEWS = require("../../src/utils/AE_wallet_storage");
const AEC = require("../../src/utils/AE_comms_dummy");
const AEL = require("../../src/AE_library");
const AEU = require("../../src/utils/AE_utils");


async function main() {

    // TODO - Executing more than once this test return NON VALID LOGIN
    console.log("AE06_credential_issuance STARTED");

    // Change to your storage path
    let storagePath = "/home/juftavira/Proyectos/AlastriaEPIC/test/standarized";

    // Create communications dummy object
    let commsD = new AEC.AE_comms_dummy;

    // Recovering form identity wallet file
 
    /////////////////////////////////////////////////////
    // FIRST CREATE THE OBJECTS and RECOVER EXISTING IDENTITY WALLET
    console.log("AE06 - U - Credential issuance -  User -\tCreate object and load identity");
    let userIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_User_Identity_Wallet.json");
    let userEpicWallet = new AEUW.AE_userWallet();
    userEpicWallet.readIdentityWallet(userIdentityWalletJSON);

   
    console.log("AE06 - E - Credential issuance -  Entity -\tCreate object and load identity");
    let entityIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Entity_Identity_Wallet.json");
    let entityEpicWallet = new AEEW.AE_entityWallet();
    entityEpicWallet.readIdentityWallet(entityIdentityWalletJSON);


    console.log("AE06 - P - Credential issuance -  Provider -\tCreate object and load identity");
    let providerIdentityWalletJSON = AEWS.readIdentityWallet( storagePath + "/test_data/AE02_Provider_Identity_Wallet.json");
    let providerEpicWallet = new AEEW.AE_entityWallet();
    providerEpicWallet.readIdentityWallet(providerIdentityWalletJSON);


    // Prepare Credential, sample contents
    // Read sample credential

    console.log("AE06 - P - Credential issuance -  Provider -\tPrepare Credential");
    let sampleCredential = fs.readFileSync(storagePath + "/sample_credential.json");
    
    // Replace in the credential the ISSUER with Issuer's ExtendedPublicKey
    let purpose = "credencialIssuance_extPublicKey";
    let puK = entityEpicWallet.getPurposePublicKey(purpose);
    credentialText = credentialText.replace("$ISSUER", puK);

    // Replace in the credential the SCHOOL with the School's ExtentendedPublicKey
    // in this case Issuer = School but Issuer's ExtendedPublicKey is the credencialIssuance
    // and the school is the base, this is atipical
    purpose = "identity_ExtPublicKey";
    puK = entityEpicWallet.getPurposePublicKey(purpose);
    credentialText = credentialText.replace("$SCHOOL", puK);


    // User send his two derivations to the Entity, this is the same as sending the DID/ExtPubKey for the crendetial as: 
    // credExtPubK = derive(userExtPubK,credentialDerivation) where credentialDerivation = userDerivation + "/" + entityDerivation
    console.log("AE06 - P - Credential issuance -  User -\tSend credential derivation to Entity");
    let credentialUserDerivation = AEL.getRandomIntDerivation().toString() + "/" + AEL.getRandomIntDerivation().toString();
    commsD.SendTo("JohnDoe","AcmeDriving","credentialUserDerivation",credentialUserDerivation);

    // Entity receives userCredentialDerivation
    let userDerivation = commsD.Receive("JohnDoe","AcmeDriving","credentialUserDerivation");

    // Entity selects entityDerivation
    let entityDerivation = AEL.getRandomIntDerivation().toString();

    // Entity calculates credExtPubKey == DID for this credential
    let user = entityEpicWallet.getCPlusDerivation("JohnDoe");
    let tmpUserWallet = AEL.createRO_HDWalletFromPublicExtendedKey(user.data.other_extendedPublicKey);
    let userCredWallet = AEL.getHDWalletDerivation(tmpUserWallet,AEU.cleanDerivation(userDerivation+"/"+entityDerivation));
    let userCredExtPubK = AEL.getPublicExtendedKey(userCredWallet);

    // Entity finishes the credential preparation
    credentialText = credentialText.replace("$SUBJECT", userCredExtPubK);

    let credentialHash = AEL.getHash(credentialText);
    
    // Entity stores credential metaData
    entityEpicWallet.setCredentialInfo(
        "JohnDoe",
        credentialHash,
        subjectPublicKey,
        credUserDer,
        credEntityDer);


    // Entity signs credential
    credentialSignature = await entityEpicWallet.signCredential(credentialText);

    // Entity sends data to User
    // credentialEntityDerivation
    // credentialHash
    // credential
    // credential signature



    console.log("AE06_credential_issuance FINISHED");
}

main();

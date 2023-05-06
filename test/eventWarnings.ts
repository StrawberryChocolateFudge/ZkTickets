import { expect } from "chai";
import { ethers } from "hardhat"

describe("Event warnings contract", function () {
    it("should deploy the event warnings", async function () {
        const EventWarningsFactory = await ethers.getContractFactory("EventWarnings");
        const eventWarningsDeploy = await EventWarningsFactory.deploy();
        const eventWarningsContract = await eventWarningsDeploy.deployed();
        const [owner, eventCreator, buyer1, buyer2] = await ethers.getSigners();

        const WarningLevel = {
            NONE: 0,
            LOW: 1,
            MEDIUM: 2,
            HIGHT: 3
        }

        const warningMessage = "I did not receive a refund after the event";

        await eventWarningsContract.createWarning(WarningLevel.MEDIUM, warningMessage, eventCreator.address);

        const warningCountOfEventCreator = await eventWarningsContract.warningCount(eventCreator.address);
        expect(warningCountOfEventCreator).to.equal(1);

        let errorOccured = false;
        let errReason = "";
        try {
            await eventWarningsContract.createWarning(WarningLevel.MEDIUM, "I did not receive a refund after the event", eventCreator.address);
        } catch (err) {
            errorOccured = true;
            errReason = err.message;
        }

        expect(errorOccured).to.be.true;
        expect(errReason.includes("Warning already exists!")).to.be.true;

        let warnings = await eventWarningsContract.getWarnings(eventCreator.address);

        expect(warnings.length).to.equal(1);

        let warning = warnings[0];

        expect(warning.level).to.equal(WarningLevel.MEDIUM);

        expect(warning.message).to.equal(warningMessage);

        let warningCount = await eventWarningsContract.warningCount(eventCreator.address);

        expect(warningCount).to.equal(1);

        const newMessage = "Nevermind";

        await eventWarningsContract.editWarning(WarningLevel.NONE, newMessage, eventCreator.address, 0);

        warnings = await eventWarningsContract.getWarnings(eventCreator.address);

        warning = warnings[0];

        expect(warning.level).to.equal(WarningLevel.NONE);
        expect(warning.message).to.equal("Nevermind");

        await eventWarningsContract.connect(buyer1).createWarning(WarningLevel.HIGHT, "BAD EVENT", eventCreator.address);

        warningCount = await eventWarningsContract.warningCount(eventCreator.address);

        expect(warningCount).to.equal(2);
    })
})
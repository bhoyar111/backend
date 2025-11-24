import controller from "../../src/authController/controller.js";
import User from "../../src/models/users.js";
import Otp2FA from "../../src/models/otp2FA.js";
import * as customeFunction from "../../src/utils/customeFunction.js";
import * as customeResponse from "../../src/utils/customeResponse.js";
import * as formatters from "../../src/utils/formatters.js";
// import * as Constant from '../../config/Constant.js';
import * as emailTemplate from "../../src/utils/emailSend/emailTemplate.js";

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    process.env.NODE_ENV = "test";
    process.env.JWT_KEY = "test_jwt_key";
    process.env.GOOGLE_CLIENT_ID = "test_google_client_id";
    process.env.CLIENT_BASE_PATH = "http://localhost:3000";
  });

  test("testFunctionExecutesWithValidInput", async () => {
    req.body = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      mobile: "1234567890",
      password: "password123",
      role: "Patient",
      registerFrom: "google",
    };

    // Insert a user with a unique email to avoid "already exists"
    await User.deleteMany({ email: req.body.email });
    const response = await controller.signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("User added successfully"),
      })
    );
  });

  test("testFunctionReturnsExpectedOutput", async () => {
    // Create a user for login
    const password = "password123";
    const hashedPassword = await customeFunction.getHashedPassword(password);
    const user = new User({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      mobile: "9876543210",
      password: hashedPassword,
      role: "Patient",
      isActive: true,
      isDeleted: false,
      verified: true,
    });
    await user.save();

    req.body = {
      email: "jane@example.com",
      password: password,
      role: "Patient",
    };

    await controller.logIn(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("Welcome Back"),
      })
    );
  });

  test("testFunctionHandlesMultipleValidInputs", async () => {
    // Test loginWithGoogle with two different users
    const fakeGooglePayload1 = {
      email: "googleuser1@example.com",
      name: "Google",
      family_name: "User1",
      picture: "",
      sub: "googleid1",
    };
    const fakeGooglePayload2 = {
      email: "googleuser2@example.com",
      name: "Google",
      family_name: "User2",
      picture: "",
      sub: "googleid2",
    };

    // Simulate Google client verifyIdToken
    controller.__Rewire__("googleClient", {
      verifyIdToken: jest.fn().mockImplementation(({ idToken }) => ({
        getPayload: () =>
          idToken === "token1" ? fakeGooglePayload1 : fakeGooglePayload2,
      })),
    });

    req.body = { token: "token1", role: "Patient" };
    await controller.loginWithGoogle(req, res);

    req.body = { token: "token2", role: "Patient" };
    await controller.loginWithGoogle(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("Login with Google successful"),
      })
    );
  });

  test("testFunctionHandlesEmptyInput", async () => {
    req.body = {};
    await controller.signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Missing required fields"),
      })
    );
  });

  test("testFunctionHandlesInvalidInputTypes", async () => {
    req.body = {
      firstName: 123,
      lastName: {},
      email: [],
      mobile: null,
      password: undefined,
      role: 42,
      registerFrom: false,
    };
    await controller.signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Missing required fields"),
      })
    );
  });

  test("testFunctionHandlesExtremeInputValues", async () => {
    req.body = {
      firstName: "A".repeat(1000),
      lastName: "B".repeat(1000),
      email: `user${"x".repeat(1000)}@example.com`,
      mobile: "9".repeat(50),
      password: "P".repeat(1000),
      role: "Patient",
      registerFrom: "web",
    };

    // Remove any user with this email
    await User.deleteMany({ email: req.body.email });
    await controller.signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("User added successfully"),
      })
    );
  });
});

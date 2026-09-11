const sendEmail = async ({
  to,
  subject,
  html
}) => {
  if (!process.env.EMAIL_API_KEY) {
    throw new Error("EMAIL_API_KEY is not configured");
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not configured");
  }

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EMAIL_API_KEY}`
      },

      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject,
        html
      })
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();

    console.error(
      "Email provider error:",
      errorBody
    );

    throw new Error("Failed to send email");
  }

  return response.json();
};

const sendPasswordResetEmail = async ({
  email,
  resetUrl
}) => {
  return sendEmail({
    to: email,

    subject: "Reset your Collab PM password",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
      ">
        <h2>Reset your password</h2>

        <p>
          We received a request to reset your
          Collab PM password.
        </p>

        <p>
          Click the button below to create a
          new password.
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #ffffff;
              color: #0f172a;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link will expire in 15 minutes.
        </p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>

        <p>
          — Collab PM
        </p>
      </div>
    `
  });
};

const sendEmailChangeVerification = async ({
  email,
  verificationUrl
}) => {
  return sendEmail({
    to: email,

    subject: "Verify your new Collab PM email",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
      ">
        <h2>Verify your new email address</h2>

        <p>
          A request was made to change the email
          address associated with your Collab PM
          account.
        </p>

        <p>
          Click the button below to confirm this
          email address.
        </p>

        <p>
          <a
            href="${verificationUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #ffffff;
              color: #0f172a;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            "
          >
            Verify Email
          </a>
        </p>

        <p>
          This link will expire in 15 minutes.
        </p>

        <p>
          If you did not request this change,
          please ignore this email.
        </p>

        <p>
          — Collab PM
        </p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendEmailChangeVerification
};
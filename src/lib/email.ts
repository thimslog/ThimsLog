import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendUserAddedEmail = async ({
  firstName,
  email,
  addedByName,
  setPasswordUrl,
}: {
  firstName: string;
  email: string;
  addedByName: string;
  setPasswordUrl: string;
}) => {
  const year = new Date().getFullYear();

  const html = `
  <div style="background-color: #024a70; padding: 3rem 1.5rem; display: flex; flex-direction: column; justify-content: center;">
    <div style="width: 90%; background-color: #ffffff; margin: auto; padding: 2rem; border-radius: 2rem; display: block;">
      <h2 style=" margin-bottom: 1.2rem; font-size: 1.2rem; text-align: center; text-align: center;">Welcome to ThimsLog</h2>
      <hr />


      <h6 style="font-size: 1.2rem;">Hello ${firstName},</h6>

      <p >You have been added to <strong>ThimsLog</strong> by <strong>${addedByName}</strong></p>

      <p>Please click the button below to set your password:</p>

      <div style="text-align:center; margin: 1.5rem 0;">
        <a href="${setPasswordUrl}"
          style="background:#024a70;color:white;padding:0.8rem 1.5rem;border-radius:8px;text-decoration:none;">
          Set Your Password
        </a>
      </div>

      <p style="margin-top: 1rem;">If you did not expect this email, please contact your administrator immediately.</p>

      <div style="margin-top: 2rem; text-align: center; font-size: 0.9rem; color: #555;">
        &copy; ThimsLog ${year}
      </div>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM !== undefined && process.env.SMTP_FROM !== null
        ? process.env.SMTP_FROM
        : '"ThimsLog" <thimslogstore@gmail.com>',
    to: email,
    subject: "Your ThimsLog Account Has Been Created",
    html,
  });
};

import nodemailer from "nodemailer";
import fs from "fs";
import Handlebars from "handlebars";
import { get } from "../../../config/Config.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sm = get(process.env.NODE_ENV).SENDEMAIL;
const transporter = nodemailer.createTransport({
  host: sm.HOST,
  port: sm.PORT,
  secure: sm.SECURE,
  auth: sm.AUTH,
});

function renderTemplate(templateName, data) {
  const filePath = path.join(__dirname, "templates", `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, "utf8");
  const compiledTemplate = Handlebars.compile(source);
  return compiledTemplate(data);
}

/**
 * Send an email with dynamic options
 * @param {Object} options
 * @param {string} options.to - Recipient
 * @param {string} options.subject - Subject
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.html] - Raw HTML content
 * @param {Object} [options.template] - { name: 'templateName', data: { … } }
 * @param {Array} [options.attachments] - Attachments array
 */
export const sendEmail = ({
  to,
  subject,
  text,
  html,
  template,
  attachments = [],
}) => {
  let finalHtml = html;

  //   if (!html && template?.name) {
  //     finalHtml = renderTemplate(template.name, template.data || {});
  //   }
  const mailOptions = {
    from: sm.FROM,
    to,
    subject,
    text,
    html: finalHtml,
    attachments,
  };

  return transporter.sendMail(mailOptions);
};

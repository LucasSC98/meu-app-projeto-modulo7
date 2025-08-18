import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarEmail(
  destinatario: string,
  assunto: string,
  texto: string
) {
  await transporter.sendMail({
    from: `${process.env.EMAIL_NOME} <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: assunto,
    text: texto,
    // html: "<b>Mensagem em HTML</b>", // opciona
  });
}

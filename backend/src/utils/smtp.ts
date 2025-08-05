import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "testeappsc98@gmail.com",
    pass: "oqps ehxk oftl cfwe",
  },
});

export async function enviarEmail(
  destinatario: string,
  assunto: string,
  texto: string
) {
  await transporter.sendMail({
    from: '"Lucas" <testeappsc98@gmail.com>',
    to: destinatario,
    subject: assunto,
    text: texto,
    // html: "<b>Mensagem em HTML</b>", // opcional
  });
}

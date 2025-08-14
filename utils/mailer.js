import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((err, ok) => {
    console.log("verify ->", err || ok);
});

export async function sendPasswordResetEmail(to, resetLink) {
    const html = `
    <h2>Restablecer contraseña</h2>
    <p>Hacé clic en el siguiente botón para restablecer tu contraseña. El enlace expira en 1 hora.</p>
    <p><a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Restablecer contraseña</a></p>
    <p>Si vos no solicitaste esto, ignorá este mensaje.</p>`;

    await transporter.sendMail({
        from: `"RichAr" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to,
        subject: "Restablecer contraseña",
        html
    });
}



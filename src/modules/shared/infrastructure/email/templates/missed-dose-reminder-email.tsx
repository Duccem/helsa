import { Body, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text } from "@react-email/components";

interface MissedDoseReminderEmailProps {
  medicationName?: string;
  reminderTime?: Date;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : "http://localhost:3000";

const reminderDateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "full",
  timeStyle: "short",
});

export default function MissedDoseReminderEmail({ medicationName, reminderTime }: MissedDoseReminderEmailProps) {
  const formattedReminderTime = reminderTime ? reminderDateFormatter.format(reminderTime) : "Hace poco";

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Parece que olvidaste tu dosis</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img src={`${baseUrl}/images/logo.png`} height="45" alt="Helsa Logo" />
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Detectamos una dosis pendiente</Heading>
              <Text style={mainText}>
                Parece que olvidaste tomar <strong>{medicationName || "tu medicamento"}</strong>.
              </Text>
              <Section style={alertSection}>
                <Text style={alertLabel}>Dosis no registrada</Text>
                <Text style={alertValue}>{formattedReminderTime}</Text>
              </Section>
              <Text style={text}>
                Si ya la tomaste, marca la dosis como completada. Si no, sigue las indicaciones de tu profesional de
                salud.
              </Text>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>No modifiques tu tratamiento sin consultar con tu medico.</Text>
            </Section>
          </Section>
          <Text style={footerText}>&copy; 2026 Helsa Healthcare, Inc. Todos los derechos reservados.</Text>
        </Container>
      </Body>
    </Html>
  );
}

MissedDoseReminderEmail.PreviewProps = {
  medicationName: "Metformina 850mg",
  reminderTime: new Date("2026-03-12T14:00:00.000Z"),
} satisfies MissedDoseReminderEmailProps;

const main = {
  backgroundColor: "#fff",
  color: "#212121",
};

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#eee",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const imageSection = {
  backgroundColor: "#8167ec",
  display: "flex",
  padding: "20px 0",
  alignItems: "center",
  justifyContent: "center",
};

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "25px 35px" };

const lowerSection = { padding: "25px 35px" };

const footerText = {
  ...text,
  fontSize: "12px",
  padding: "0 20px",
};

const mainText = { ...text, marginBottom: "14px" };

const cautionText = { ...text, margin: "0px" };

const alertSection = {
  backgroundColor: "#fff3f0",
  borderRadius: "8px",
  border: "1px solid #fecaca",
  padding: "14px 16px",
};

const alertLabel = {
  ...text,
  margin: "0",
  fontSize: "12px",
  color: "#7f1d1d",
};

const alertValue = {
  ...text,
  margin: "4px 0 0",
  fontWeight: "700",
  color: "#991b1b",
};


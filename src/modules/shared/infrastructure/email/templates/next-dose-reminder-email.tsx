import { Body, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text } from "@react-email/components";

interface NextDoseReminderEmailProps {
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

export default function NextDoseReminderEmail({ medicationName, reminderTime }: NextDoseReminderEmailProps) {
  const formattedReminderTime = reminderTime ? reminderDateFormatter.format(reminderTime) : "Pronto";

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Recordatorio de tu proxima dosis</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img src={`${baseUrl}/images/logo.png`} height="45" alt="Helsa Logo" />
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Tu proxima dosis se acerca</Heading>
              <Text style={mainText}>
                Es momento de prepararte para tomar <strong>{medicationName || "tu medicamento"}</strong>.
              </Text>
              <Section style={infoSection}>
                <Text style={infoLabel}>Hora programada</Text>
                <Text style={infoValue}>{formattedReminderTime}</Text>
              </Section>
              <Text style={text}>Tomar la dosis a tiempo te ayuda a mantener el tratamiento en curso.</Text>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>Si ya tomaste esta dosis, puedes ignorar este recordatorio.</Text>
            </Section>
          </Section>
          <Text style={footerText}>&copy; 2026 Helsa Healthcare, Inc. Todos los derechos reservados.</Text>
        </Container>
      </Body>
    </Html>
  );
}

NextDoseReminderEmail.PreviewProps = {
  medicationName: "Paracetamol 500mg",
  reminderTime: new Date("2026-03-12T19:30:00.000Z"),
} satisfies NextDoseReminderEmailProps;

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

const infoSection = {
  backgroundColor: "#f7f8ff",
  borderRadius: "8px",
  padding: "14px 16px",
};

const infoLabel = {
  ...text,
  margin: "0",
  fontSize: "12px",
  color: "#52525b",
};

const infoValue = {
  ...text,
  margin: "4px 0 0",
  fontWeight: "700",
};


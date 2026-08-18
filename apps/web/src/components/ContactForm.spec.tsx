import { render, screen, fireEvent } from "@testing-library/react";
import { ContactForm } from "./ContactForm";
import { sendContactMessage, ContactError } from "@/lib/api";

// Only sendContactMessage needs to be a mock; ContactError must stay the real class since the
// component uses `instanceof ContactError` to decide which message to show.
jest.mock("@/lib/api", () => ({
  ...jest.requireActual("@/lib/api"),
  sendContactMessage: jest.fn(),
}));

const sendContactMessageMock = sendContactMessage as jest.Mock;

function fillValidForm() {
  fireEvent.change(screen.getByPlaceholderText(/your name/i), { target: { value: "Jane Doe" } });
  fireEvent.change(screen.getByPlaceholderText(/your email/i), {
    target: { value: "jane@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/your message/i), {
    target: { value: "a".repeat(20) },
  });
}

describe("ContactForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps the submit button disabled until all fields are valid", () => {
    render(<ContactForm />);
    const button = screen.getByRole("button", { name: /send message/i });

    expect(button).toBeDisabled();

    fillValidForm();

    expect(button).toBeEnabled();
  });

  it("shows a loading state, then a success message, after a successful submit", async () => {
    let resolveSend!: (value: { success: true }) => void;
    sendContactMessageMock.mockReturnValue(
      new Promise<{ success: true }>((resolve) => {
        resolveSend = resolve;
      }),
    );

    render(<ContactForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();

    resolveSend({ success: true });

    expect(await screen.findByText(/message has been sent/i)).toBeInTheDocument();
  });

  it("shows the ContactError message when the request fails", async () => {
    sendContactMessageMock.mockRejectedValue(
      new ContactError("Too many requests — please wait a minute and try again.", 429),
    );

    render(<ContactForm />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
  });
});

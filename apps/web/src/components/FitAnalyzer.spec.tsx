import { render, screen, fireEvent } from "@testing-library/react";
import { FitAnalyzer } from "./FitAnalyzer";
import { analyzeJobFit, FitAnalysisError, type FitReport } from "@/lib/api";

// Only analyzeJobFit needs to be a mock; FitAnalysisError must stay the real class since the
// component uses `instanceof FitAnalysisError` to decide which message to show.
jest.mock("@/lib/api", () => ({
  ...jest.requireActual("@/lib/api"),
  analyzeJobFit: jest.fn(),
}));

const analyzeJobFitMock = analyzeJobFit as jest.Mock;
const validJobDescription = "a".repeat(60);

const report: FitReport = {
  matchScore: 82,
  summary: "Strong overall fit.",
  strengths: [{ point: "React experience", citedSourceIndexes: [0] }],
  gaps: [{ point: "Limited Kubernetes exposure" }],
  suggestedInterviewQuestions: ["Tell me about a React project you shipped."],
};

describe("FitAnalyzer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("keeps the submit button disabled until the job description is long enough", () => {
    render(<FitAnalyzer />);
    const button = screen.getByRole("button", { name: /analyze fit/i });
    const textarea = screen.getByPlaceholderText(/paste a job description/i);

    expect(button).toBeDisabled();

    fireEvent.change(textarea, { target: { value: validJobDescription } });

    expect(button).toBeEnabled();
  });

  it("shows a loading state, then the report, after a successful submit", async () => {
    let resolveAnalysis!: (value: FitReport) => void;
    analyzeJobFitMock.mockReturnValue(
      new Promise<FitReport>((resolve) => {
        resolveAnalysis = resolve;
      }),
    );

    render(<FitAnalyzer />);
    fireEvent.change(screen.getByPlaceholderText(/paste a job description/i), {
      target: { value: validJobDescription },
    });
    fireEvent.click(screen.getByRole("button", { name: /analyze fit/i }));

    expect(screen.getByRole("button", { name: /analyzing/i })).toBeDisabled();

    resolveAnalysis(report);

    expect(await screen.findByText("82%")).toBeInTheDocument();
    expect(screen.getByText(report.summary)).toBeInTheDocument();
    expect(screen.getByText("React experience")).toBeInTheDocument();
    expect(screen.getByText("Limited Kubernetes exposure")).toBeInTheDocument();
  });

  it("shows the FitAnalysisError message when the request fails", async () => {
    analyzeJobFitMock.mockRejectedValue(
      new FitAnalysisError("Too many requests — please wait a minute and try again.", 429),
    );

    render(<FitAnalyzer />);
    fireEvent.change(screen.getByPlaceholderText(/paste a job description/i), {
      target: { value: validJobDescription },
    });
    fireEvent.click(screen.getByRole("button", { name: /analyze fit/i }));

    expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
  });
});

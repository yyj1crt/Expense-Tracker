import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders main navigation", () => {
  render(<App />);
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
});

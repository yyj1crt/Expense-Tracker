import { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, type RenderOptions } from "@testing-library/react";

const renderWithRouter = (ui: ReactElement, { route = "/" } = {}) =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);

type CustomRenderOptions = RenderOptions & {
  route?: string;
};

const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => renderWithRouter(ui, options);

export * from "@testing-library/react";
export { customRender as renderWithRouter };

import { styleVariants } from "@vanilla-extract/css";
import { sizes, radii } from "../../theme";

export const height = styleVariants(sizes, (v) => ({ height: v }));
export const radius = styleVariants(radii, (v) => ({ borderRadius: v }));

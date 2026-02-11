import chalk from "chalk";

const EMOJI = {
  error: "❌",
  success: "✅",
  warning: "⚠️",
  info: "ℹ️",
  step: "→",
} as const;

/** Log an error message (red + ❌) */
export function logError(message: string): void {
  console.error(chalk.red(`${EMOJI.error} ${message}`));
}

/** Log a success message (green + ✅) */
export function logSuccess(message: string): void {
  console.log(chalk.green(`${EMOJI.success} ${message}`));
}

/** Log a warning message (yellow + ⚠️) */
export function logWarning(message: string): void {
  console.warn(chalk.yellow(`${EMOJI.warning} ${message}`));
}

/** Log an info message (cyan + ℹ️) */
export function logInfo(message: string): void {
  console.log(chalk.cyan(`${EMOJI.info} ${message}`));
}

/** Log a step or detail (dim + →) */
export function logStep(message: string): void {
  console.log(chalk.dim(`${EMOJI.step} ${message}`));
}

/** Log the INTENT SPEC ASCII banner (clean, modern) */
export function logBanner(): void {
  const banner = `

██╗███╗   ██╗████████╗███████╗███╗   ██╗████████╗
██║████╗  ██║╚══██╔══╝██╔════╝████╗  ██║╚══██╔══╝
██║██╔██╗ ██║   ██║   █████╗  ██╔██╗ ██║   ██║   
██║██║╚██╗██║   ██║   ██╔══╝  ██║╚██╗██║   ██║   
██║██║ ╚████║   ██║   ███████╗██║ ╚████║   ██║   
╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝   ╚═╝   
                                                 
███████╗██████╗ ███████╗ ██████╗                 
██╔════╝██╔══██╗██╔════╝██╔════╝                 
███████╗██████╔╝█████╗  ██║                      
╚════██║██╔═══╝ ██╔══╝  ██║                      
███████║██║     ███████╗╚██████╗                 
╚══════╝╚═╝     ╚══════╝ ╚═════╝                 
                                                  
`;
  console.log(chalk.blue(banner));
}

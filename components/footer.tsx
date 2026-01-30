export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 py-2 px-4 text-center bg-neutral-50">
      <a
        href="https://ace-portfolio-theta.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-xs text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
      >
        Powered by <span className="font-mono font-semibold">&lt;ACE/&gt;</span>
      </a>
    </footer>
  );
}

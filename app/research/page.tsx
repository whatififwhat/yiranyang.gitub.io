import type { Metadata } from 'next';
import { SiteFrame } from '../site-frame';

export const metadata: Metadata = { title: 'Research — Yiran Yang', description: 'Research on planetary interiors, the lunar exosphere, and prebiotic compartments.', alternates: { canonical: '/research/' } };

const research = [
  {
    title: 'CH₄–H₂ Demixing in Ice-Giant Interiors with a Machine-Learned Potential',
    description: 'I am developing a carbon–hydrogen machine-learned potential using a SCAN+rVV10 density functional theory dataset, and using molecular dynamics to construct the CH₄–H₂ phase diagram at 0.1–15 GPa and 400–2500 K. This project couples phase relations and equations of state to Uranus and Neptune interior models to evaluate the effects of demixing on density structure, gravitational moments, and heat transport.',
    figure: {
      src: '/images/mlp-validation.png',
      alt: 'Comparison of machine-learned potential predictions and VASP reference calculations for energy, force components, and virial components across 800 static configurations.',
      caption: 'Machine-learned potential predictions of energies, forces, and virials are compared with VASP reference values for 800 static configurations.',
      width: 2048,
      height: 656,
      compact: false,
    },
  },
  {
    title: 'Space-Environment Controls on the Lunar Exosphere',
    description: 'I combined global magnetohydrodynamic simulations across eight lunar phases with returned-sample composition data and sputtering and impact-vaporization models to quantify environmental controls on lunar exosphere composition. I developed a collisionless ballistic-transport framework based on Liouville’s theorem to calculate number densities.',
    figure: {
      src: '/images/lunar-exosphere-density.png',
      alt: 'Lunar exosphere number density versus altitude for O, Si, Al, Mg, Ca, Fe, and Na from micrometeoroid impact vaporization, extending to 10,000 kilometres.',
      caption: 'Lunar exosphere number-density profiles from micrometeoroid impact vaporization are shown for seven atomic species up to 10,000 km altitude.',
      width: 1189,
      height: 790,
      compact: true,
    },
  },
  {
    title: 'Membraneless Polyester Microdroplets as Prebiotic Compartments',
    description: 'I investigated how wet–dry cycles control the formation and properties of polyester microdroplets as potential prebiotic compartments. I characterized polymer chain-length distributions using mass spectrometry and evaluated microdroplet compatibility with biomolecules using fluorescence microscopy.',
  },
  {
    title: 'Fatty-Acid Vesicles as Protocell Compartments',
    description: 'I tested how silica affects fatty-acid vesicle formation and stability under simulated prebiotic Earth conditions. I characterized vesicle morphology and size distributions using UV–Vis spectroscopy, fluorescence and confocal microscopy, and dynamic light scattering.',
  },
];


export default function Page() {
  return <SiteFrame path="/research">
    <section id="research" aria-labelledby="research-title">
          <div className="research-copy"><h1 id="research-title">Research</h1></div>
          {research.map(project => <article className="research-project" key={project.title}>
            <div className="research-copy">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
            </div>
            {project.figure && <figure className={`research-figure${project.figure.compact ? ' research-figure--compact' : ''}`}>
              <a href={project.figure.src} target="_blank" rel="noreferrer">
                <img src={project.figure.src} alt={project.figure.alt} width={project.figure.width} height={project.figure.height} />
              </a>
              <figcaption>{project.figure.caption}</figcaption>
            </figure>}
          </article>)}
        </section>
  </SiteFrame>;
}

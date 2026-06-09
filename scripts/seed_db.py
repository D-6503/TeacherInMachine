#!/usr/bin/env python3
"""
Seed database with initial data:
- 3 subjects (Physics, Chemistry, Mathematics)
- 5 topics each (real NCERT class 11 chapter names)
- 3 questions per topic (1 per bloom level)
- 1 admin user: admin@jee.com / admin123
- 1 demo student: student@jee.com / student123
- StudentProgress rows for demo student
"""
import asyncio
import sys
import os

# Add parent dir to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select
from passlib.context import CryptContext
import uuid
from datetime import datetime

from app.config import settings
from app.models.student import Student
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.question import Question
from app.models.progress import StudentProgress

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SUBJECTS = [
    {"name": "Physics", "class_level": 11, "description": "Study of matter, energy, and the universe"},
    {"name": "Chemistry", "class_level": 11, "description": "Study of substances, their properties and reactions"},
    {"name": "Mathematics", "class_level": 11, "description": "Study of numbers, quantities, and shapes"},
]

TOPICS = {
    "Physics": [
        {"title": "Units and Measurements", "description": "Physical quantities, SI units, significant figures, errors in measurement", "sequence_order": 1, "summary": "## Units and Measurements\n\nPhysical quantities are classified as **fundamental** (mass, length, time, temperature, current, luminous intensity, amount of substance) and **derived**. The SI system is the international standard.\n\n**Key Concepts:**\n- Dimensional analysis and its applications\n- Significant figures and rounding rules\n- Absolute, relative, and percentage errors\n- Systematic vs random errors\n\n**Important Formulas:**\n- % error = (ΔA/A) × 100\n- For multiplication: (ΔZ/Z) = (ΔA/A) + (ΔB/B)"},
        {"title": "Motion in a Straight Line", "description": "Kinematics, velocity, acceleration, equations of motion", "sequence_order": 2, "summary": "## Motion in a Straight Line\n\nKinematics describes motion without considering its cause.\n\n**Equations of Motion:**\n- v = u + at\n- s = ut + ½at²\n- v² = u² + 2as\n- s_n = u + a(2n-1)/2\n\n**Key Concepts:**\n- Distance vs Displacement\n- Speed vs Velocity\n- Uniform vs Non-uniform motion\n- v-t and x-t graphs"},
        {"title": "Laws of Motion", "description": "Newton's three laws, friction, circular motion dynamics", "sequence_order": 3, "summary": "## Laws of Motion\n\n**Newton's Three Laws:**\n1. A body remains at rest or in uniform motion unless acted upon by a net force\n2. F = ma (net force = mass × acceleration)\n3. Every action has an equal and opposite reaction\n\n**Friction:**\n- Static friction: f_s ≤ μ_s N\n- Kinetic friction: f_k = μ_k N\n- μ_s > μ_k always"},
        {"title": "Work, Energy and Power", "description": "Work-energy theorem, potential and kinetic energy, conservation of energy", "sequence_order": 4, "summary": "## Work, Energy and Power\n\n**Work:** W = F·d·cos θ\n**Kinetic Energy:** KE = ½mv²\n**Potential Energy:** PE = mgh (gravitational)\n**Work-Energy Theorem:** W_net = ΔKE\n\n**Power:** P = W/t = F·v\n\n**Conservation of Energy:** Total mechanical energy is conserved in absence of non-conservative forces."},
        {"title": "Gravitation", "description": "Universal law of gravitation, gravitational potential, satellites", "sequence_order": 5, "summary": "## Gravitation\n\n**Universal Law:** F = Gm₁m₂/r²\nG = 6.674 × 10⁻¹¹ N·m²/kg²\n\n**Gravitational Acceleration:** g = GM/R²\n- At height h: g_h = g(1 - 2h/R)\n- At depth d: g_d = g(1 - d/R)\n\n**Escape Velocity:** v_e = √(2gR) ≈ 11.2 km/s\n**Orbital Velocity:** v_o = √(GM/r)"},
    ],
    "Chemistry": [
        {"title": "Some Basic Concepts of Chemistry", "description": "Mole concept, atomic mass, molecular mass, stoichiometry", "sequence_order": 1, "summary": "## Some Basic Concepts of Chemistry\n\n**Mole Concept:** 1 mole = 6.022 × 10²³ particles (Avogadro's number)\n\n**Molar Mass:** Mass of 1 mole of substance in grams\n**Molarity:** M = moles of solute / litre of solution\n**Molality:** m = moles of solute / kg of solvent\n\n**Law of Conservation of Mass:** Mass is neither created nor destroyed\n**Law of Definite Proportions:** Fixed ratio of elements in a compound"},
        {"title": "Structure of Atom", "description": "Atomic models, quantum numbers, electronic configuration", "sequence_order": 2, "summary": "## Structure of Atom\n\n**Atomic Models:** Thomson → Rutherford → Bohr → Quantum mechanical\n\n**Quantum Numbers:**\n- Principal (n): shell number\n- Azimuthal (l): 0 to n-1\n- Magnetic (m_l): -l to +l\n- Spin (m_s): +½ or -½\n\n**Electronic Configuration Rules:**\n- Aufbau principle: fill lowest energy orbitals first\n- Pauli exclusion: no two electrons have same four quantum numbers\n- Hund's rule: maximize unpaired electrons"},
        {"title": "Classification of Elements", "description": "Periodic table, trends in properties, periodicity", "sequence_order": 3, "summary": "## Classification of Elements\n\n**Modern Periodic Law:** Properties of elements are periodic functions of their atomic numbers.\n\n**Periodic Trends:**\n- Atomic radius: increases down group, decreases across period\n- Ionization energy: decreases down group, increases across period\n- Electronegativity: decreases down group, increases across period\n- Electron affinity: generally increases across period"},
        {"title": "Chemical Bonding", "description": "Ionic, covalent, metallic bonds, VSEPR theory, hybridization", "sequence_order": 4, "summary": "## Chemical Bonding\n\n**Types of Bonds:**\n- Ionic: transfer of electrons (metal + non-metal)\n- Covalent: sharing of electrons\n- Metallic: sea of electrons\n\n**VSEPR Theory:** Electron pairs repel each other → determines molecular geometry\n**Hybridization:** sp (linear), sp² (trigonal planar), sp³ (tetrahedral)\n\n**Bond Properties:** Bond length ∝ 1/bond order; Bond energy ∝ bond order"},
        {"title": "States of Matter", "description": "Gas laws, kinetic theory, liquid state, surface tension", "sequence_order": 5, "summary": "## States of Matter\n\n**Gas Laws:**\n- Boyle's Law: PV = constant (at constant T)\n- Charles's Law: V/T = constant (at constant P)\n- Avogadro's Law: V ∝ n (at constant T, P)\n- Ideal Gas Equation: PV = nRT\n\n**Kinetic Theory:** Gas molecules in random motion; average KE = (3/2)kT\n\n**van der Waals Equation:** (P + an²/V²)(V - nb) = nRT"},
    ],
    "Mathematics": [
        {"title": "Sets", "description": "Set theory, Venn diagrams, operations on sets, De Morgan's laws", "sequence_order": 1, "summary": "## Sets\n\n**Definition:** A set is a well-defined collection of objects.\n\n**Types:** Empty set (∅), Finite, Infinite, Universal set\n\n**Operations:**\n- Union: A ∪ B = {x : x ∈ A or x ∈ B}\n- Intersection: A ∩ B = {x : x ∈ A and x ∈ B}\n- Difference: A - B = {x : x ∈ A and x ∉ B}\n- Complement: A' = U - A\n\n**De Morgan's Laws:** (A ∪ B)' = A' ∩ B'; (A ∩ B)' = A' ∪ B'"},
        {"title": "Relations and Functions", "description": "Relations, types of functions, domain and range, composition", "sequence_order": 2, "summary": "## Relations and Functions\n\n**Relation:** A subset of A × B\n**Function:** A relation where each element of domain has exactly one image\n\n**Types of Functions:**\n- One-one (injective): different inputs → different outputs\n- Onto (surjective): range = codomain\n- Bijective: one-one + onto\n\n**Composition:** (g∘f)(x) = g(f(x))\n**Inverse Function:** exists iff function is bijective"},
        {"title": "Trigonometric Functions", "description": "Trigonometric ratios, identities, graphs, inverse trig functions", "sequence_order": 3, "summary": "## Trigonometric Functions\n\n**Fundamental Identities:**\n- sin²θ + cos²θ = 1\n- 1 + tan²θ = sec²θ\n- 1 + cot²θ = cosec²θ\n\n**Compound Angle Formulas:**\n- sin(A±B) = sinA cosB ± cosA sinB\n- cos(A±B) = cosA cosB ∓ sinA sinB\n\n**Period:** sin, cos: 2π; tan, cot: π\n\n**General Solutions:** sin θ = sin α → θ = nπ + (-1)ⁿα"},
        {"title": "Principle of Mathematical Induction", "description": "Mathematical induction, base case, inductive step, applications", "sequence_order": 4, "summary": "## Principle of Mathematical Induction\n\n**Steps:**\n1. **Base Case:** Prove P(1) is true\n2. **Inductive Hypothesis:** Assume P(k) is true\n3. **Inductive Step:** Prove P(k+1) is true using P(k)\n\n**Standard Results:**\n- Σn = n(n+1)/2\n- Σn² = n(n+1)(2n+1)/6\n- Σn³ = [n(n+1)/2]²\n\nUsed to prove inequalities, divisibility, and series summation formulas."},
        {"title": "Complex Numbers", "description": "Complex numbers, Argand plane, modulus, argument, De Moivre's theorem", "sequence_order": 5, "summary": "## Complex Numbers\n\n**Form:** z = a + ib, where i = √(-1), i² = -1\n**Modulus:** |z| = √(a² + b²)\n**Argument:** arg(z) = arctan(b/a)\n\n**Polar Form:** z = r(cosθ + i sinθ) = re^(iθ)\n\n**De Moivre's Theorem:** (cosθ + i sinθ)ⁿ = cos(nθ) + i sin(nθ)\n\n**Conjugate:** z̄ = a - ib; z·z̄ = |z|²\n**Cube Roots of Unity:** 1, ω, ω² where ω = e^(2πi/3)"},
    ],
}

QUESTIONS_TEMPLATE = {
    "Physics": {
        "Units and Measurements": [
            {"bloom_level": "remember", "question_text": "What is the SI unit of luminous intensity, and what are the seven fundamental SI units?", "expected_answer": "The SI unit of luminous intensity is the candela (cd). The seven fundamental SI units are: metre (m) for length, kilogram (kg) for mass, second (s) for time, ampere (A) for electric current, kelvin (K) for thermodynamic temperature, mole (mol) for amount of substance, and candela (cd) for luminous intensity."},
            {"bloom_level": "understand", "question_text": "Explain the significance of significant figures in measurements and state the rules for counting them.", "expected_answer": "Significant figures represent the precision of a measurement. Rules: (1) All non-zero digits are significant. (2) Zeros between non-zero digits are significant. (3) Leading zeros are not significant. (4) Trailing zeros in a decimal number are significant. (5) Trailing zeros in a whole number without decimal point may or may not be significant. The result of calculations should not have more significant figures than the least precise measurement used."},
            {"bloom_level": "apply", "question_text": "The period of a simple pendulum is T = 2π√(L/g). If L is measured as 1.00 m with 1% error and g is measured with 2% error, what is the percentage error in T?", "expected_answer": "Using error propagation for T = 2π√(L/g) = 2π·L^(1/2)·g^(-1/2), the percentage error in T is: %ΔT = (1/2)%ΔL + (1/2)%Δg = (1/2)(1%) + (1/2)(2%) = 0.5% + 1% = 1.5%. Therefore, the percentage error in the period T is 1.5%."},
        ],
        "Motion in a Straight Line": [
            {"bloom_level": "remember", "question_text": "State the three equations of motion for uniform acceleration.", "expected_answer": "The three equations of motion for uniform acceleration are: (1) v = u + at, where v is final velocity, u is initial velocity, a is acceleration, and t is time. (2) s = ut + ½at², where s is displacement. (3) v² = u² + 2as. These are valid only when acceleration is constant and motion is in a straight line."},
            {"bloom_level": "understand", "question_text": "Distinguish between distance and displacement, and between speed and velocity, with examples.", "expected_answer": "Distance is the total path length traveled (scalar), while displacement is the shortest distance from initial to final position (vector). Example: A person walking 3 km East then 4 km North has distance = 7 km but displacement = 5 km (NE). Speed is the rate of change of distance (scalar = distance/time), while velocity is the rate of change of displacement (vector = displacement/time). A car going around a circular track at constant speed has changing velocity because direction changes."},
            {"bloom_level": "apply", "question_text": "A ball is thrown vertically upward with velocity 20 m/s. Calculate the maximum height reached and total time of flight. (g = 10 m/s²)", "expected_answer": "At maximum height, final velocity v = 0. Using v² = u² - 2gh (taking upward positive): 0 = (20)² - 2(10)h → h = 400/20 = 20 m. Time to reach max height: v = u - gt → 0 = 20 - 10t → t = 2 s. By symmetry, total time of flight = 2t = 4 s. The ball reaches a maximum height of 20 m and returns to the ground after 4 seconds."},
        ],
        "Laws of Motion": [
            {"bloom_level": "remember", "question_text": "State Newton's three laws of motion.", "expected_answer": "Newton's First Law (Law of Inertia): A body at rest remains at rest and a body in motion continues in uniform motion in a straight line unless acted upon by an external net force. Newton's Second Law: The rate of change of momentum of a body is directly proportional to the net external force applied; F = ma. Newton's Third Law: For every action, there is an equal and opposite reaction; forces always occur in pairs acting on different bodies."},
            {"bloom_level": "understand", "question_text": "Explain the concept of friction. Distinguish between static and kinetic friction.", "expected_answer": "Friction is a contact force that opposes relative motion or tendency of motion between surfaces. Static friction (f_s) acts when there is no relative motion; it can vary from 0 to a maximum value f_s(max) = μ_s·N, where μ_s is the coefficient of static friction and N is the normal force. Kinetic (sliding) friction (f_k = μ_k·N) acts when surfaces slide against each other. Key distinction: μ_s > μ_k always, meaning it's harder to start motion than to maintain it. Friction depends on surface nature and normal force, not on contact area."},
            {"bloom_level": "apply", "question_text": "A 5 kg block rests on a horizontal surface (μ_s = 0.4, μ_k = 0.3). Find: (a) minimum force to start motion, (b) force needed to maintain motion at constant velocity. (g = 10 m/s²)", "expected_answer": "Normal force N = mg = 5 × 10 = 50 N. (a) Minimum force to start motion = maximum static friction = μ_s × N = 0.4 × 50 = 20 N. (b) For constant velocity, acceleration = 0, so applied force = kinetic friction = μ_k × N = 0.3 × 50 = 15 N. The block requires 20 N to start moving and only 15 N to maintain constant velocity."},
        ],
        "Work, Energy and Power": [
            {"bloom_level": "remember", "question_text": "State the work-energy theorem and write the formula for kinetic energy.", "expected_answer": "The Work-Energy Theorem states that the net work done on an object equals the change in its kinetic energy: W_net = ΔKE = ½mv² - ½mu². Kinetic Energy formula: KE = ½mv², where m is mass in kg and v is speed in m/s. This theorem applies regardless of the path taken and whether the force is constant or variable."},
            {"bloom_level": "understand", "question_text": "Explain the law of conservation of mechanical energy with a suitable example.", "expected_answer": "The Law of Conservation of Mechanical Energy states that in the absence of non-conservative forces (like friction), the total mechanical energy (KE + PE) remains constant. Example — Free falling object: At top, KE=0, PE=mgh; at midpoint, KE=½mv₁², PE=mgh/2; at bottom, KE=mgh, PE=0. At every point: KE + PE = mgh = constant. Verification: At midpoint, using v₁²=2g(h/2), KE=½m(gh)=mgh/2; total = mgh/2 + mgh/2 = mgh ✓. Energy merely converts between forms without being created or destroyed."},
            {"bloom_level": "apply", "question_text": "A 2 kg ball falls freely from a height of 10 m. Calculate its KE just before hitting the ground, its PE when it has fallen 6 m, and verify energy conservation. (g = 10 m/s²)", "expected_answer": "Initial total mechanical energy = mgh = 2 × 10 × 10 = 200 J. KE just before hitting ground: all PE converts to KE, so KE = 200 J. Velocity at ground: v² = 2gh = 2×10×10 = 200, v = √200 m/s; KE = ½×2×200 = 200 J ✓. After falling 6 m (height remaining = 4 m): PE = mgh' = 2×10×4 = 80 J; KE = 200 - 80 = 120 J. Verification: KE + PE = 120 + 80 = 200 J = initial energy ✓. Energy is conserved throughout."},
        ],
        "Gravitation": [
            {"bloom_level": "remember", "question_text": "State Newton's Universal Law of Gravitation and give the value of G.", "expected_answer": "Newton's Universal Law of Gravitation: Every particle in the universe attracts every other particle with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between them. F = Gm₁m₂/r², where F is gravitational force (N), m₁ and m₂ are masses (kg), r is distance between their centers (m), and G is the Universal Gravitational Constant = 6.674 × 10⁻¹¹ N·m²·kg⁻². This force acts along the line joining the two particles."},
            {"bloom_level": "understand", "question_text": "Derive an expression for the escape velocity from Earth's surface.", "expected_answer": "Escape velocity is the minimum speed needed to escape Earth's gravitational field. Setting total mechanical energy = 0 at infinity: KE + PE = 0. ½mv_e² + (-GMm/R) = 0. ½mv_e² = GMm/R. v_e² = 2GM/R. Since g = GM/R², we have GM = gR². Therefore v_e = √(2gR²/R) = √(2gR). Substituting g = 9.8 m/s² and R = 6.4 × 10⁶ m: v_e = √(2 × 9.8 × 6.4 × 10⁶) ≈ 11.2 km/s. This is independent of the mass of the object being launched."},
            {"bloom_level": "apply", "question_text": "A satellite orbits Earth at height h = 400 km above the surface. Calculate its orbital velocity and time period. (R_Earth = 6400 km, g = 9.8 m/s²)", "expected_answer": "Orbital radius r = R + h = 6400 + 400 = 6800 km = 6.8 × 10⁶ m. Orbital velocity: v_o = √(GM/r). Using GM = gR² = 9.8 × (6.4×10⁶)² = 4.014 × 10¹⁴ m³/s². v_o = √(4.014×10¹⁴ / 6.8×10⁶) = √(5.9×10⁷) ≈ 7682 m/s ≈ 7.68 km/s. Time period: T = 2πr/v_o = 2π × 6.8×10⁶ / 7682 ≈ 5560 s ≈ 92.7 minutes. This is approximately the orbital period of the International Space Station."},
        ],
    },
    "Chemistry": {
        "Some Basic Concepts of Chemistry": [
            {"bloom_level": "remember", "question_text": "Define the mole and state Avogadro's number. What is molar mass?", "expected_answer": "The mole is the SI unit for amount of substance. One mole contains exactly 6.022 × 10²³ particles (atoms, molecules, ions, etc.) — this is Avogadro's number (N_A). Molar mass is the mass of one mole of a substance expressed in grams per mole (g/mol). It numerically equals the atomic/molecular mass in atomic mass units (u). Examples: molar mass of H₂O = 18 g/mol; molar mass of NaCl = 58.5 g/mol."},
            {"bloom_level": "understand", "question_text": "Explain molarity and molality. When would you prefer molality over molarity?", "expected_answer": "Molarity (M) = moles of solute / volume of solution in litres. It is temperature-dependent because volume changes with temperature. Molality (m) = moles of solute / mass of solvent in kg. It is temperature-independent because mass doesn't change with temperature. Preference: Molality is preferred for colligative properties (boiling point elevation, freezing point depression) because these calculations involve mass of solvent and the relationships are temperature-independent. Molarity is used for volumetric analysis and when preparing solutions of specific concentrations for reactions."},
            {"bloom_level": "apply", "question_text": "Calculate the molarity of a solution prepared by dissolving 5.85 g of NaCl (molar mass = 58.5 g/mol) in water to make 500 mL of solution.", "expected_answer": "Step 1: Calculate moles of NaCl = mass / molar mass = 5.85 / 58.5 = 0.1 mol. Step 2: Convert volume to litres = 500 mL = 0.5 L. Step 3: Molarity = moles / volume (L) = 0.1 / 0.5 = 0.2 M. Therefore, the molarity of the NaCl solution is 0.2 M (or 0.2 mol/L). This means there are 0.2 moles of NaCl dissolved per litre of solution."},
        ],
        "Structure of Atom": [
            {"bloom_level": "remember", "question_text": "State the four quantum numbers and their significance.", "expected_answer": "The four quantum numbers are: (1) Principal quantum number (n): indicates the main energy level/shell; n = 1, 2, 3... Higher n = higher energy and larger orbital. (2) Azimuthal/Angular momentum quantum number (l): indicates subshell shape; l = 0 to (n-1); l=0(s), l=1(p), l=2(d), l=3(f). (3) Magnetic quantum number (m_l): indicates orbital orientation; m_l = -l to +l. (4) Spin quantum number (m_s): indicates electron spin; m_s = +½ (spin up) or -½ (spin down). Together they uniquely identify each electron in an atom (Pauli exclusion principle)."},
            {"bloom_level": "understand", "question_text": "Explain the Aufbau principle, Pauli exclusion principle, and Hund's rule with examples.", "expected_answer": "Aufbau Principle: Electrons fill orbitals in order of increasing energy (1s→2s→2p→3s→3p→4s→3d...). Example: Carbon (Z=6) has configuration 1s²2s²2p² — 2p gets electrons after 2s is full. Pauli Exclusion Principle: No two electrons in an atom can have the same set of four quantum numbers; each orbital holds maximum 2 electrons with opposite spins. Example: Both electrons in 1s have n=1,l=0,m_l=0 but m_s=+½ and -½. Hund's Rule: In degenerate orbitals (same energy), electrons fill singly with parallel spins before pairing. Example: Nitrogen (2p³): each p orbital gets one electron with same spin (↑↑↑), not (↑↓)(↑)."},
            {"bloom_level": "apply", "question_text": "Write the electronic configuration of iron (Z=26) and determine how many unpaired electrons it has.", "expected_answer": "Electronic configuration of Fe (Z=26): 1s²2s²2p⁶3s²3p⁶3d⁶4s². Or in noble gas notation: [Ar] 3d⁶4s². Filling the 3d subshell: the 6 electrons in 3d fill as follows (by Hund's rule): ↑↓ ↑ ↑ ↑ ↑ (pairing only when necessary). The 3d orbitals have: one orbital with 2 electrons (1 pair) and four orbitals with 1 electron each. Unpaired electrons = 4. Iron has 4 unpaired electrons, making it paramagnetic (attracted to magnetic fields). This also explains iron's variable oxidation states of +2 and +3."},
        ],
        "Classification of Elements": [
            {"bloom_level": "remember", "question_text": "State the Modern Periodic Law and describe how elements are arranged in the periodic table.", "expected_answer": "Modern Periodic Law: The physical and chemical properties of elements are periodic functions of their atomic numbers. Elements are arranged in the periodic table in order of increasing atomic number. The table has 7 horizontal rows called periods and 18 vertical columns called groups. Elements in the same group have similar electronic configurations in their outermost shell and hence similar chemical properties. Periods 1, 2, 3 are short periods (2, 8, 8 elements); periods 4, 5, 6, 7 are long periods. The d-block (transition metals) spans groups 3-12, f-block (lanthanides/actinides) is placed separately."},
            {"bloom_level": "understand", "question_text": "Explain the periodic trends in atomic radius and ionization energy across a period and down a group.", "expected_answer": "Atomic Radius: Across a period (left to right) — atomic radius decreases because nuclear charge increases while electrons are added to the same shell, increasing effective nuclear charge and pulling electrons closer. Down a group — atomic radius increases because new electron shells are added, increasing distance from nucleus despite higher nuclear charge. Ionization Energy (energy to remove outermost electron): Across a period — IE increases because atomic radius decreases and nuclear charge increases, making it harder to remove electrons. Down a group — IE decreases because atomic radius increases and electrons are further from nucleus with more shielding. Noble gases have highest IE in their period."},
            {"bloom_level": "apply", "question_text": "Arrange Na, Mg, Al, Si in order of increasing first ionization energy and justify your answer.", "expected_answer": "Arranging in increasing order of first IE: Na < Mg < Al < Si — but wait, Al has lower IE than Mg despite being to its right. Corrected order: Na < Al < Mg < Si. Explanation: Na (IE₁ ≈ 496 kJ/mol): s¹ configuration, easy to remove. Al (IE₁ ≈ 577 kJ/mol): removes a 3p¹ electron which is shielded by 3s² electrons, so easier than expected. Mg (IE₁ ≈ 738 kJ/mol): removes an electron from full 3s² (extra stability of filled subshell makes it harder than Al). Si (IE₁ ≈ 786 kJ/mol): removes 3p² electron, highest in this group. The anomaly between Mg and Al is due to extra stability of completely filled s subshell."},
        ],
        "Chemical Bonding": [
            {"bloom_level": "remember", "question_text": "Define ionic bond and covalent bond. Give one example of each.", "expected_answer": "Ionic Bond: Formed by the complete transfer of one or more electrons from one atom (usually metal) to another (usually non-metal), resulting in oppositely charged ions that attract each other electrostatically. The bond is non-directional. Example: NaCl — Na transfers its 3s¹ electron to Cl, forming Na⁺ and Cl⁻. Covalent Bond: Formed by the mutual sharing of electron pairs between atoms (usually non-metals), allowing both atoms to achieve stable electron configurations. Can be single (1 pair), double (2 pairs), or triple (3 pairs) bonds. Example: H₂O — oxygen shares one electron pair each with two hydrogen atoms, forming two O-H single covalent bonds."},
            {"bloom_level": "understand", "question_text": "Explain VSEPR theory and predict the shapes of H₂O and NH₃.", "expected_answer": "VSEPR (Valence Shell Electron Pair Repulsion) Theory: Electron pairs in the valence shell of a central atom arrange themselves to minimize repulsion. Lone pairs repel more than bond pairs (LP-LP > LP-BP > BP-BP). H₂O: O has 4 electron pairs (2 bond pairs + 2 lone pairs). Basic geometry is tetrahedral, but molecular shape (considering only atoms) is V-shaped/bent with bond angle ≈ 104.5° (less than 109.5° tetrahedral due to 2 lone pairs compressing angle). NH₃: N has 4 electron pairs (3 bond pairs + 1 lone pair). Basic geometry tetrahedral, molecular shape is trigonal pyramidal with bond angle ≈ 107° (less than tetrahedral due to 1 lone pair)."},
            {"bloom_level": "apply", "question_text": "Determine the hybridization and geometry of BeCl₂, BF₃, CH₄, and PCl₅.", "expected_answer": "BeCl₂: Be has 2 bond pairs, 0 lone pairs. Electron pairs around Be = 2. Hybridization = sp. Geometry = linear. Bond angle = 180°. BF₃: B has 3 bond pairs, 0 lone pairs. Electron pairs = 3. Hybridization = sp². Geometry = trigonal planar. Bond angle = 120°. CH₄: C has 4 bond pairs, 0 lone pairs. Electron pairs = 4. Hybridization = sp³. Geometry = tetrahedral. Bond angle = 109.5°. PCl₅: P has 5 bond pairs, 0 lone pairs. Electron pairs = 5. Hybridization = sp³d. Geometry = trigonal bipyramidal. Bond angles = 90° (axial-equatorial) and 120° (equatorial-equatorial)."},
        ],
        "States of Matter": [
            {"bloom_level": "remember", "question_text": "State Boyle's Law, Charles's Law, and Avogadro's Law. Combine them to derive the ideal gas equation.", "expected_answer": "Boyle's Law: At constant temperature, pressure of a fixed amount of gas is inversely proportional to its volume: P ∝ 1/V or PV = constant. Charles's Law: At constant pressure, volume of a fixed amount of gas is directly proportional to its absolute temperature: V ∝ T or V/T = constant. Avogadro's Law: At constant T and P, volume is proportional to number of moles: V ∝ n. Combining: V ∝ nT/P → V = nRT/P → PV = nRT. Here R = Universal Gas Constant = 8.314 J·mol⁻¹·K⁻¹. This is the Ideal Gas Equation."},
            {"bloom_level": "understand", "question_text": "Why do real gases deviate from ideal behavior? Explain the significance of van der Waals constants a and b.", "expected_answer": "Ideal gas assumptions that break down for real gases: (1) Ideal gas: molecules have zero volume. Reality: molecules occupy finite volume. (2) Ideal gas: no intermolecular attractions. Reality: attractions exist especially at high pressure and low temperature. Van der Waals equation: (P + an²/V²)(V - nb) = nRT. Constant 'a': measures intermolecular attractive forces. The term an²/V² is the 'pressure correction' — actual pressure is less than ideal because molecules attract each other before hitting walls. Higher 'a' = stronger intermolecular forces (e.g., polar/large molecules). Constant 'b': measures the volume excluded by molecular repulsions — effective volume available = V - nb. Higher 'b' = larger molecular size."},
            {"bloom_level": "apply", "question_text": "Calculate the pressure exerted by 2 moles of CO₂ at 400 K in a 5 L container using ideal gas law, then comment on how real gas behavior would change this. (a = 3.59 L²·atm/mol², b = 0.0427 L/mol, R = 0.0821 L·atm/mol·K)", "expected_answer": "Ideal Gas: PV = nRT → P = nRT/V = (2 × 0.0821 × 400) / 5 = 65.68 / 5 = 13.14 atm. Van der Waals Equation: (P + an²/V²)(V - nb) = nRT. P + (3.59 × 4/25) = nRT/(V-nb) = (2 × 0.0821 × 400)/(5 - 2×0.0427) = 65.68/4.9146 = 13.37. P = 13.37 - 0.574 = 12.80 atm. Real pressure (12.80 atm) < Ideal pressure (13.14 atm). This is because: the attractive forces between CO₂ molecules reduce the impact on walls (pressure correction dominates at moderate pressures), partially offset by the volume exclusion effect. CO₂ has significant intermolecular attractions due to its large size and slight polarity."},
        ],
    },
    "Mathematics": {
        "Sets": [
            {"bloom_level": "remember", "question_text": "Define a set and list the different types of sets with examples.", "expected_answer": "A set is a well-defined collection of distinct objects. Types: Empty/Null Set (∅ or {}): contains no elements. e.g., {x: x is a prime number between 7 and 11}. Singleton Set: exactly one element. e.g., {5}. Finite Set: countable number of elements. e.g., {1,2,3,4,5}. Infinite Set: uncountable elements. e.g., set of natural numbers ℕ. Equal Sets: same elements. e.g., {1,2,3} = {3,1,2}. Subset: A⊆B if every element of A is in B. Power Set P(A): set of all subsets of A; |P(A)| = 2^n where n = |A|. Universal Set (U): contains all sets under consideration."},
            {"bloom_level": "understand", "question_text": "State and prove De Morgan's Laws for sets.", "expected_answer": "De Morgan's Laws: (1) (A ∪ B)' = A' ∩ B' — complement of union equals intersection of complements. (2) (A ∩ B)' = A' ∪ B' — complement of intersection equals union of complements. Proof of Law 1: Let x ∈ (A ∪ B)'. Then x ∉ (A ∪ B) → x ∉ A AND x ∉ B → x ∈ A' AND x ∈ B' → x ∈ A' ∩ B'. Conversely, if x ∈ A' ∩ B', then x ∈ A' AND x ∈ B' → x ∉ A AND x ∉ B → x ∉ (A ∪ B) → x ∈ (A ∪ B)'. Hence (A ∪ B)' = A' ∩ B'. Law 2 proved similarly. These laws are fundamental in logic and circuit design (AND/OR gates)."},
            {"bloom_level": "apply", "question_text": "In a class of 60 students, 35 play cricket, 28 play football, and 15 play both. Using set theory, find: (a) students who play only cricket, (b) students who play neither sport.", "expected_answer": "Let C = cricket players, F = football players. |C| = 35, |F| = 28, |C ∩ F| = 15, Total = 60. (a) Students who play only cricket = |C| - |C ∩ F| = 35 - 15 = 20. (b) Using inclusion-exclusion: |C ∪ F| = |C| + |F| - |C ∩ F| = 35 + 28 - 15 = 48. Students who play neither = Total - |C ∪ F| = 60 - 48 = 12. Verification: Only cricket: 20, only football: 28-15=13, both: 15, neither: 12. Total = 20+13+15+12 = 60 ✓."},
        ],
        "Relations and Functions": [
            {"bloom_level": "remember", "question_text": "Define a function and distinguish between one-one (injective), onto (surjective), and bijective functions.", "expected_answer": "A function f: A→B is a relation where each element of A (domain) is associated with exactly one element of B (codomain). One-One (Injective): f(x₁) = f(x₂) ⟹ x₁ = x₂; different inputs give different outputs. Example: f(x) = 2x. Onto (Surjective): range = codomain; every element of B has at least one pre-image in A. Example: f: ℝ→ℝ, f(x) = x³ is onto. Bijective: both one-one and onto; establishes a perfect one-to-one correspondence. Example: f(x) = x+1 from ℝ to ℝ. Only bijective functions have inverses. Horizontal line test: one-one if every horizontal line meets graph at most once; onto if meets at least once."},
            {"bloom_level": "understand", "question_text": "Explain composition of functions. If f(x) = 2x+1 and g(x) = x², find (g∘f)(x) and (f∘g)(x). Are they equal?", "expected_answer": "Composition of functions (g∘f)(x) = g(f(x)): first apply f, then apply g to the result. Given f(x) = 2x+1 and g(x) = x²: (g∘f)(x) = g(f(x)) = g(2x+1) = (2x+1)² = 4x²+4x+1. (f∘g)(x) = f(g(x)) = f(x²) = 2(x²)+1 = 2x²+1. Comparison: 4x²+4x+1 ≠ 2x²+1 (e.g., at x=1: g∘f=9, f∘g=3). Therefore (g∘f) ≠ (f∘g) — composition of functions is generally NOT commutative. This is a crucial distinction from multiplication of numbers."},
            {"bloom_level": "apply", "question_text": "Determine whether f: ℝ→ℝ defined by f(x) = 3x - 5 is bijective. If yes, find its inverse.", "expected_answer": "Testing One-One: Assume f(x₁) = f(x₂). Then 3x₁-5 = 3x₂-5 → 3x₁ = 3x₂ → x₁ = x₂. So f is one-one (injective). Testing Onto: For any y ∈ ℝ, we need x ∈ ℝ such that f(x) = y. 3x-5 = y → x = (y+5)/3. Since y ∈ ℝ, x = (y+5)/3 ∈ ℝ. So every y has a pre-image → f is onto (surjective). Since f is both one-one and onto, f is bijective. Finding Inverse: Let y = f(x) = 3x-5. Solving for x: x = (y+5)/3. Replace y with x: f⁻¹(x) = (x+5)/3. Verification: f(f⁻¹(x)) = f((x+5)/3) = 3·(x+5)/3 - 5 = x+5-5 = x ✓."},
        ],
        "Trigonometric Functions": [
            {"bloom_level": "remember", "question_text": "State the Pythagorean trigonometric identities and write the compound angle formulas for sin(A+B) and cos(A+B).", "expected_answer": "Pythagorean Identities: (1) sin²θ + cos²θ = 1 (fundamental). (2) 1 + tan²θ = sec²θ (dividing (1) by cos²θ). (3) 1 + cot²θ = cosec²θ (dividing (1) by sin²θ). Compound Angle Formulas: sin(A+B) = sinA·cosB + cosA·sinB. sin(A-B) = sinA·cosB - cosA·sinB. cos(A+B) = cosA·cosB - sinA·sinB. cos(A-B) = cosA·cosB + sinA·sinB. Memory aid for sin: 'sine-cos-cos, cos-sin-sine'; the sign between terms matches the original sign. For cos: the middle sign is flipped from the original."},
            {"bloom_level": "understand", "question_text": "Explain the concept of general solution of trigonometric equations. Derive the general solution for sin θ = sin α.", "expected_answer": "The trigonometric functions are periodic, so equations like sinθ = sinα have infinitely many solutions. The general solution expresses all solutions compactly. Derivation for sinθ = sinα: sinθ - sinα = 0. Using sum-to-product: 2cos((θ+α)/2)·sin((θ-α)/2) = 0. Either cos((θ+α)/2) = 0 → (θ+α)/2 = (2n+1)π/2 → θ = (2n+1)π - α, or sin((θ-α)/2) = 0 → (θ-α)/2 = nπ → θ = 2nπ + α. Combining: θ = nπ + (-1)ⁿα, n ∈ ℤ. This single formula captures both cases: when n is even, θ = 2kπ + α; when n is odd, θ = (2k+1)π - α."},
            {"bloom_level": "apply", "question_text": "Prove that: sin75° + cos75° = √6/2.", "expected_answer": "Method using compound angles: sin75° = sin(45°+30°) = sin45°cos30° + cos45°sin30° = (√2/2)(√3/2) + (√2/2)(1/2) = √6/4 + √2/4. cos75° = cos(45°+30°) = cos45°cos30° - sin45°sin30° = (√2/2)(√3/2) - (√2/2)(1/2) = √6/4 - √2/4. Therefore: sin75° + cos75° = (√6/4 + √2/4) + (√6/4 - √2/4) = 2√6/4 = √6/2. Hence proved that sin75° + cos75° = √6/2 ≈ 1.225."},
        ],
        "Principle of Mathematical Induction": [
            {"bloom_level": "remember", "question_text": "State the Principle of Mathematical Induction and its two steps.", "expected_answer": "The Principle of Mathematical Induction is a method to prove statements involving natural numbers. It states: Let P(n) be a statement involving natural number n. If: Step 1 (Base Case): P(1) is true (or P(k₀) for some initial value k₀). Step 2 (Inductive Step): Assuming P(k) is true (inductive hypothesis), we can prove P(k+1) is also true. Then P(n) is true for all natural numbers n ≥ 1 (or n ≥ k₀). Analogy: Like dominoes — if the first falls AND each falling domino knocks the next, then all dominoes fall."},
            {"bloom_level": "understand", "question_text": "Explain why both the base case and inductive step are necessary. Give a counterexample showing failure if either is missing.", "expected_answer": "Both steps are essential: Base case anchors the proof; inductive step propagates it. If base case fails: Consider 'n² + n + 41 is prime for all n'. Works for n=0,1,...,39 (inductive step seems provable locally), but fails at n=40 (40²+40+41=41²=1681, not prime). If inductive step fails: 'P(n): all horses are the same color'. P(1): trivially true (1 horse). The inductive step 'if true for k, then for k+1' fails at k=1 (going from 1 horse to 2 horses provides no overlap to compare colors). Without the inductive step, base case alone proves nothing beyond P(1). Without base case: We could 'prove' P(n) implies P(n+1) for '2n < n' — but starting point is never established."},
            {"bloom_level": "apply", "question_text": "Prove by mathematical induction: 1² + 2² + 3² + ... + n² = n(n+1)(2n+1)/6.", "expected_answer": "Let P(n): 1² + 2² + ... + n² = n(n+1)(2n+1)/6. Base Case P(1): LHS = 1² = 1. RHS = 1(2)(3)/6 = 6/6 = 1. LHS = RHS ✓. P(1) is true. Inductive Step: Assume P(k) is true: 1² + 2² + ... + k² = k(k+1)(2k+1)/6. Prove P(k+1): 1² + 2² + ... + k² + (k+1)² = k(k+1)(2k+1)/6 + (k+1)². = (k+1)[k(2k+1)/6 + (k+1)]. = (k+1)[k(2k+1) + 6(k+1)]/6. = (k+1)[2k²+k+6k+6]/6. = (k+1)(2k²+7k+6)/6. = (k+1)(k+2)(2k+3)/6. = (k+1)((k+1)+1)(2(k+1)+1)/6. This is exactly the formula with n=k+1 ✓. By PMI, P(n) is true for all n ∈ ℕ."},
        ],
        "Complex Numbers": [
            {"bloom_level": "remember", "question_text": "Define a complex number. What are its modulus and argument? State De Moivre's theorem.", "expected_answer": "A complex number z = a + ib, where a,b ∈ ℝ and i = √(-1) (imaginary unit, i² = -1). 'a' is the real part Re(z), 'b' is the imaginary part Im(z). Modulus: |z| = r = √(a² + b²) — distance from origin in Argand plane; always non-negative. Argument: arg(z) = θ = arctan(b/a) — angle made with positive real axis; measured counterclockwise; principal argument θ ∈ (-π, π]. Polar form: z = r(cosθ + i·sinθ) = re^(iθ). De Moivre's Theorem: For any integer n: (cosθ + i·sinθ)ⁿ = cos(nθ) + i·sin(nθ). Used to find powers and roots of complex numbers."},
            {"bloom_level": "understand", "question_text": "Explain the Argand plane representation of complex numbers. What is the geometric meaning of |z₁ - z₂|?", "expected_answer": "The Argand plane (complex plane) is a 2D coordinate system where the x-axis represents the real part and y-axis represents the imaginary part of a complex number. Each complex number z = a + ib corresponds to the point (a, b). Geometric representations: Addition z₁ + z₂: vector addition (parallelogram law). Multiplication by i: rotation by 90° counterclockwise. |z|: distance from origin to point (a,b). Geometric meaning of |z₁ - z₂|: This represents the distance between the two points z₁ = (a₁,b₁) and z₂ = (a₂,b₂) in the Argand plane. |z₁-z₂| = √((a₁-a₂)² + (b₁-b₂)²). Application: The locus |z - z₀| = r represents a circle centered at z₀ with radius r in the complex plane."},
            {"bloom_level": "apply", "question_text": "Find the cube roots of unity (solutions to z³ = 1) and verify that 1 + ω + ω² = 0.", "expected_answer": "Solving z³ = 1 = e^(i·2kπ) for k = 0, 1, 2: z = e^(i·2kπ/3) = cos(2kπ/3) + i·sin(2kπ/3). k=0: z₁ = 1 (real root). k=1: ω = cos(2π/3) + i·sin(2π/3) = -1/2 + i(√3/2). k=2: ω² = cos(4π/3) + i·sin(4π/3) = -1/2 - i(√3/2). Verification 1 + ω + ω² = 0: 1 + (-1/2 + i√3/2) + (-1/2 - i√3/2) = 1 - 1/2 - 1/2 + i(√3/2 - √3/2) = 0 + 0i = 0 ✓. Additional property: ω³ = 1, so ω and ω² are complex conjugates. These roots are equally spaced at 120° on the unit circle. The cube roots of unity are {1, ω, ω²} where ω = e^(2πi/3)."},
        ],
    },
}


async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    AsyncSession_ = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSession_() as session:
        # ---- Admin user ----
        existing_admin = await session.execute(select(Student).where(Student.email == "admin@jee.com"))
        if not existing_admin.scalar_one_or_none():
            admin = Student(
                id=uuid.uuid4(),
                name="JEE Admin",
                email="admin@jee.com",
                password_hash=pwd_context.hash("admin123"),
                role="admin",
                created_at=datetime.utcnow(),
                is_active=True,
            )
            session.add(admin)
            print("Created admin user: admin@jee.com / admin123")
        else:
            print("Admin user already exists")

        # ---- Demo student ----
        existing_student = await session.execute(select(Student).where(Student.email == "student@jee.com"))
        demo_student = existing_student.scalar_one_or_none()
        if not demo_student:
            demo_student = Student(
                id=uuid.uuid4(),
                name="Demo Student",
                email="student@jee.com",
                password_hash=pwd_context.hash("student123"),
                role="student",
                created_at=datetime.utcnow(),
                is_active=True,
            )
            session.add(demo_student)
            print("Created demo student: student@jee.com / student123")
        else:
            print("Demo student already exists")

        await session.flush()

        # Re-fetch demo student id
        demo_student_result = await session.execute(select(Student).where(Student.email == "student@jee.com"))
        demo_student = demo_student_result.scalar_one()

        # ---- Subjects ----
        subject_map = {}
        for subj_data in SUBJECTS:
            existing = await session.execute(select(Subject).where(Subject.name == subj_data["name"]))
            existing_subj = existing.scalar_one_or_none()
            if not existing_subj:
                subj = Subject(
                    id=uuid.uuid4(),
                    name=subj_data["name"],
                    class_level=subj_data["class_level"],
                    description=subj_data["description"],
                )
                session.add(subj)
                await session.flush()
                subject_map[subj_data["name"]] = subj
                print(f"Created subject: {subj_data['name']}")
            else:
                subject_map[subj_data["name"]] = existing_subj

        # ---- Topics and Questions ----
        for subj_name, topics in TOPICS.items():
            subject = subject_map[subj_name]
            for i, topic_data in enumerate(topics):
                existing_topic = await session.execute(
                    select(Topic).where(Topic.subject_id == subject.id, Topic.title == topic_data["title"])
                )
                topic = existing_topic.scalar_one_or_none()
                if not topic:
                    topic = Topic(
                        id=uuid.uuid4(),
                        subject_id=subject.id,
                        title=topic_data["title"],
                        sequence_order=topic_data["sequence_order"],
                        description=topic_data.get("description", ""),
                        summary=topic_data.get("summary", ""),
                        pass_threshold=0.70,
                        is_active=True,
                    )
                    session.add(topic)
                    await session.flush()
                    print(f"  Created topic: {topic_data['title']}")

                    # Add questions for this topic
                    questions_for_topic = QUESTIONS_TEMPLATE.get(subj_name, {}).get(topic_data["title"], [])
                    for q_data in questions_for_topic:
                        q = Question(
                            id=uuid.uuid4(),
                            topic_id=topic.id,
                            question_text=q_data["question_text"],
                            expected_answer=q_data["expected_answer"],
                            bloom_level=q_data["bloom_level"],
                            created_by="tutor",
                            is_validated=True,
                            is_active=True,
                            created_at=datetime.utcnow(),
                        )
                        session.add(q)
                    print(f"    Added {len(questions_for_topic)} questions")

                # ---- Student Progress ----
                existing_progress = await session.execute(
                    select(StudentProgress).where(
                        StudentProgress.student_id == demo_student.id,
                        StudentProgress.topic_id == topic.id,
                    )
                )
                if not existing_progress.scalar_one_or_none():
                    # First topic of each subject = in_progress, rest = locked
                    status = "in_progress" if i == 0 else "locked"
                    progress = StudentProgress(
                        id=uuid.uuid4(),
                        student_id=demo_student.id,
                        topic_id=topic.id,
                        status=status,
                        best_score=0.0,
                        attempts_count=0,
                        updated_at=datetime.utcnow(),
                    )
                    session.add(progress)

        await session.commit()
        print("\nDatabase seeded successfully!")
        print("Admin:   admin@jee.com   / admin123")
        print("Student: student@jee.com / student123")



    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())

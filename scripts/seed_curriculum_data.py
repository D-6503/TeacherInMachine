#!/usr/bin/env python3
import sqlite3
import os
import sys
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend", "jeeapp.db")

CURRICULUM = {
    # PHYSICS
    "Kinematics": {
        "summary": """## Kinematics: Motion in One and Two Dimensions

Kinematics describes motion without considering its cause (force).

**Key Definitions:**
- **Distance:** Scalar quantity representing total path length.
- **Displacement:** Vector quantity representing shortest path from initial to final position.
- **Velocity:** Rate of change of displacement. $v = \\frac{ds}{dt}$ (instantaneous).
- **Acceleration:** Rate of change of velocity. $a = \\frac{dv}{dt}$ (instantaneous).

**Equations of Motion (For Constant Acceleration):**
1. $v = u + at$
2. $s = ut + \\frac{1}{2}at^2$
3. $v^2 = u^2 + 2as$
4. Displacement in $n$-th second: $s_n = u + \\frac{a}{2}(2n-1)$

**Projectile Motion (2D Motion):**
- Angle of projection: $\\theta$, Initial speed: $u$
- **Time of Flight:** $T = \\frac{2u \\sin \\theta}{g}$
- **Maximum Height:** $H = \\frac{u^2 \\sin^2 \\theta}{2g}$
- **Horizontal Range:** $R = \\frac{u^2 \\sin 2\\theta}{g}$ (Maximum at $\\theta = 45^\\circ$)""",
        "questions": [
            {
                "bloom_level": "remember",
                "question": "What is motion?",
                "expected_answer": "Motion is the change in position of an object with respect to time relative to a reference frame."
            },
            {
                "bloom_level": "remember",
                "question": "What is a reference frame?",
                "expected_answer": "A reference frame is a point or coordinate system with respect to which the position and motion of an object are observed and measured."
            },
            {
                "bloom_level": "remember",
                "question": "What is the difference between a scalar and a vector quantity?",
                "expected_answer": "| Scalar | Vector |\n| --- | --- |\n| Has magnitude only | Has magnitude and direction |\n| Example: Distance, Speed | Example: Displacement, Velocity |"
            },
            {
                "bloom_level": "remember",
                "question": "Define distance and displacement.",
                "expected_answer": "Distance: Total path length traveled by an object.\n\nDisplacement: Shortest straight-line distance between initial and final positions along with direction."
            },
            {
                "bloom_level": "remember",
                "question": "Define speed and velocity.",
                "expected_answer": "Speed: Rate of change of distance with time.\n\nVelocity: Rate of change of displacement with time."
            },
            {
                "bloom_level": "remember",
                "question": "Define acceleration.",
                "expected_answer": "Acceleration is the rate of change of velocity with respect to time."
            },
            {
                "bloom_level": "remember",
                "question": "What is rectilinear motion?",
                "expected_answer": "Motion along a straight-line path."
            },
            {
                "bloom_level": "remember",
                "question": "What is curvilinear motion?",
                "expected_answer": "Motion along a curved path."
            },
            {
                "bloom_level": "remember",
                "question": "What is circular motion?",
                "expected_answer": "Motion of an object along a circular path about a fixed center."
            },
            {
                "bloom_level": "remember",
                "question": "What is projectile motion?",
                "expected_answer": "Motion of an object projected into the air and moving under the influence of gravity alone."
            },
            {
                "bloom_level": "remember",
                "question": "State the three equations of motion.",
                "expected_answer": "v=u+at\n\ns=ut+\\frac{1}{2}at^2\n\nv^2=u^2+2as"
            },
            {
                "bloom_level": "remember",
                "question": "Under what conditions are the equations of motion valid?",
                "expected_answer": "They are valid only when acceleration remains constant throughout the motion."
            },
            {
                "bloom_level": "remember",
                "question": "What does the slope of a displacement-time graph represent?",
                "expected_answer": "Velocity."
            },
            {
                "bloom_level": "remember",
                "question": "What does the slope of a velocity-time graph represent?",
                "expected_answer": "Acceleration."
            },
            {
                "bloom_level": "remember",
                "question": "What does the area under a velocity-time graph represent?",
                "expected_answer": "Displacement."
            },
            {
                "bloom_level": "understand",
                "question": "Why is distance always greater than or equal to displacement?",
                "expected_answer": "Distance is the actual path length traveled, whereas displacement is the shortest distance between initial and final positions. Therefore, distance can never be less than displacement."
            },
            {
                "bloom_level": "understand",
                "question": "Can displacement be zero while distance is non-zero?",
                "expected_answer": "Yes.\n\nExample: Completing one full lap of a circular track.\n\nDistance > 0 but displacement = 0 because the starting and ending points are the same."
            },
            {
                "bloom_level": "understand",
                "question": "Why can speed remain constant while velocity changes?",
                "expected_answer": "Velocity depends on both magnitude and direction. If direction changes while speed remains constant, velocity changes.\n\nExample: Uniform circular motion."
            },
            {
                "bloom_level": "understand",
                "question": "Explain the difference between average speed and average velocity.",
                "expected_answer": "Average Speed = Total Distance / Total Time\n\nAverage Velocity = Total Displacement / Total Time\n\nAverage speed depends on path length, while average velocity depends only on displacement."
            },
            {
                "bloom_level": "understand",
                "question": "Why can an object have zero velocity but non-zero acceleration?",
                "expected_answer": "At the highest point of vertical motion, velocity becomes zero momentarily, but acceleration due to gravity continues to act downward."
            },
            {
                "bloom_level": "understand",
                "question": "Why are the equations of motion applicable only for constant acceleration?",
                "expected_answer": "The equations are derived assuming acceleration remains constant. If acceleration changes, these equations are no longer valid."
            },
            {
                "bloom_level": "understand",
                "question": "Explain the physical meaning of the equation v = u + at.",
                "expected_answer": "The equation shows that the final velocity of an object equals its initial velocity plus the change in velocity produced by acceleration over time."
            },
            {
                "bloom_level": "understand",
                "question": "How does a velocity-time graph help us understand acceleration?",
                "expected_answer": "Acceleration is represented by the slope of the velocity-time graph.\n\n* Positive slope -> Positive acceleration\n* Negative slope -> Retardation\n* Zero slope -> Constant velocity"
            },
            {
                "bloom_level": "understand",
                "question": "Why is projectile motion considered a combination of horizontal and vertical motions?",
                "expected_answer": "Projectile motion consists of independent horizontal motion with constant velocity and vertical motion with acceleration due to gravity."
            },
            {
                "bloom_level": "understand",
                "question": "Why is the path of a projectile parabolic?",
                "expected_answer": "The combination of constant horizontal motion and uniformly accelerated vertical motion produces a parabolic trajectory."
            },
            {
                "bloom_level": "understand",
                "question": "Why do passengers sitting inside a moving train appear stationary to one another?",
                "expected_answer": "They move with the same velocity; therefore, their relative velocity is zero."
            },
            {
                "bloom_level": "apply",
                "question": "A car starts from rest and accelerates uniformly at 2 m/s² for 10 s.",
                "expected_answer": "Final Velocity = 20 m/s\n\nDistance Travelled = 100 m\n\nDetailed solution:\nGiven: u = 0 m/s, a = 2 m/s², t = 10 s.\nFinal Velocity: v = u + at = 0 + (2 * 10) = 20 m/s.\nDistance Travelled: s = ut + 1/2 at^2 = 0 + 1/2 * 2 * 100 = 100 m."
            },
            {
                "bloom_level": "apply",
                "question": "A train moving at 20 m/s comes to rest in 5 s.",
                "expected_answer": "Acceleration = -4 m/s²\n\nDetailed solution:\nGiven: u = 20 m/s, v = 0 m/s, t = 5 s.\na = (v - u)/t = (0 - 20)/5 = -4 m/s²."
            },
            {
                "bloom_level": "apply",
                "question": "A ball is thrown vertically upward with initial speed 20 m/s.",
                "expected_answer": "Maximum Height = 20 m\n\nTime to Reach Highest Point = 2 s\n\nDetailed solution:\nGiven: u = 20 m/s, v = 0, g = 10 m/s².\nMaximum Height: v^2 = u^2 - 2gh => 0 = 400 - 20h => h = 20 m.\nTime to Reach Highest Point: v = u - gt => 0 = 20 - 10t => t = 2 s."
            },
            {
                "bloom_level": "apply",
                "question": "A projectile is launched at 20 m/s making 30° with the horizontal.",
                "expected_answer": "Time of Flight = 2 s\n\nMaximum Height = 5 m\n\nHorizontal Range = 34.6 m\n\nDetailed solution:\nGiven: u = 20 m/s, θ = 30°, g = 10 m/s².\nTime of Flight: T = (2u sinθ)/g = (2 * 20 * 0.5)/10 = 2 s.\nMaximum Height: H = (u^2 sin^2θ)/(2g) = (400 * 0.25)/20 = 5 m.\nHorizontal Range: R = (u^2 sin2θ)/g = (400 * 0.866)/10 = 34.6 m."
            }
        ]
    },
    "Laws of Motion": {
        "summary": """## Laws of Motion

**Newton's Three Laws:**
1. **First Law (Inertia):** A body remains at rest or in uniform motion unless acted upon by a net external force.
2. **Second Law (Force):** The rate of change of momentum is proportional to the net external force: $F = \\frac{dp}{dt} = ma$.
3. **Third Law (Action-Reaction):** For every action, there is an equal and opposite reaction acting on different bodies.

**Friction:**
- Opposes relative motion between surfaces.
- **Static Friction:** $f_s \\le \\mu_s N$ (self-adjusting force).
- **Kinetic Friction:** $f_k = \\mu_k N$.
- Note: $\\mu_s > \\mu_k$ always.

**Circular Motion Dynamics:**
- **Centripetal Force:** $F_c = \\frac{mv^2}{r} = m\\omega^2 r$.
- **Maximum safe speed on flat banked road:** $v_{max} = \\sqrt{\\mu g r}$.
- **Banked Road (no friction):** $v = \\sqrt{gr \\tan \\theta}$.""",
        "remember": {
            "question": "State Newton's three laws of motion and write the formula for linear momentum.",
            "expected_answer": "Newton's First Law states that a body remains at rest or in uniform motion unless acted on by a net external force. Second Law states F = ma (force equals mass times acceleration). Third Law states that every action has an equal and opposite reaction. Linear momentum is defined as p = mv."
        },
        "understand": {
            "question": "Explain the concept of 'banking of roads' and why it is necessary for high-speed turns.",
            "expected_answer": "Banking of roads is the practice of raising the outer edge of a curved road above the inner edge. When a vehicle takes a turn, centripetal force is required. On a flat road, this force is provided solely by static friction, which is unreliable in wet or icy conditions. By banking the road at an angle, the normal force has a horizontal component pointing toward the center of the curve. This component provides the necessary centripetal force, reducing reliance on friction and allowing safer high-speed turns."
        },
        "apply": {
            "question": "A 10 kg block is placed on a rough horizontal surface with μ_s = 0.5 and μ_k = 0.4. If a horizontal force of 40 N is applied to the block, find the force of friction acting on it. (g = 10 m/s²)",
            "expected_answer": "First, find the normal force: N = mg = 10 * 10 = 100 N. The maximum static friction force is f_s_max = μ_s * N = 0.5 * 100 = 50 N. The applied force is 40 N. Since the applied force (40 N) is less than the maximum static friction (50 N), the block does not move. Therefore, static friction adjusts itself to equal the applied force. The friction force acting on the block is 40 N."
        }
    },
    "Work, Energy and Power": {
        "summary": """## Work, Energy and Power

**Work:**
- $W = \\vec{F} \\cdot \\vec{d} = F d \\cos \\theta$.
- For variable force: $W = \\int F dx$.

**Kinetic Energy (KE) & Potential Energy (PE):**
- $KE = \\frac{1}{2}mv^2 = \\frac{p^2}{2m}$.
- **Work-Energy Theorem:** $W_{net} = \\Delta KE = KE_f - KE_i$.
- **Conservative Forces:** Work done is independent of path (e.g., gravity, spring force: $U = \\frac{1}{2}kx^2$).
- **Non-conservative Forces:** Work done is path-dependent (e.g., friction).

**Conservation of Mechanical Energy:**
- In the absence of non-conservative forces, $E_{total} = KE + PE = \\text{constant}$.

**Power:**
- Rate of doing work. $P = \\frac{dW}{dt} = \\vec{F} \\cdot \\vec{v}$. Unit: Watt (W).""",
        "remember": {
            "question": "State the Work-Energy Theorem and write the formula for the potential energy of a stretched spring.",
            "expected_answer": "The Work-Energy Theorem states that the net work done by all forces acting on a body is equal to the change in its kinetic energy (W = ΔKE). The potential energy of a stretched spring is U = 1/2 * k * x², where k is the spring constant and x is the displacement from equilibrium."
        },
        "understand": {
            "question": "Explain the difference between conservative and non-conservative forces, providing one example of each.",
            "expected_answer": "A conservative force is one for which the work done in moving an object between two points is independent of the path taken. Gravity and electrostatic forces are conservative. A non-conservative force is one for which the work done depends on the path taken, meaning mechanical energy is dissipated into thermal or other forms of energy. Friction and air resistance are examples."
        },
        "apply": {
            "question": "A 2 kg mass slides down a 5m long frictionless incline of angle 30° from rest. Find its velocity at the bottom of the incline. (g = 10 m/s²)",
            "expected_answer": "Using the conservation of mechanical energy: Initial potential energy is PE = mgh. The height h is h = L * sin(30°) = 5 * 0.5 = 2.5 meters. So PE_initial = 2 * 10 * 2.5 = 50 J. Since there is no friction, the initial PE converts entirely to KE at the bottom: KE_final = 1/2 * m * v² = 50 -> 1/2 * 2 * v² = 50 -> v² = 50 -> v = √50 ≈ 7.07 m/s."
        }
    },
    "Rotational Motion": {
        "summary": """## System of Particles and Rotational Motion

**Center of Mass (COM):**
- Position vector: $\\vec{R}_{com} = \\frac{\\sum m_i \\vec{r}_i}{\\sum m_i}$.

**Rotational Kinematics & Dynamics:**
- **Angular Velocity:** $\\omega = \\frac{d\\theta}{dt}$, **Angular Acceleration:** $\\alpha = \\frac{d\\omega}{dt}$.
- Linear-Rotational relations: $v = r\\omega$, $a_t = r\\alpha$.
- **Torque:** $\\vec{\\tau} = \\vec{r} \\times \\vec{F} = I\\vec{\\alpha}$.
- **Moment of Inertia:** $I = \\sum m_i r_i^2 = \\int r^2 dm$.
  - Ring: $I = MR^2$
  - Disc: $I = \\frac{1}{2}MR^2$
  - Solid Sphere: $I = \\frac{2}{5}MR^2$

**Angular Momentum:**
- $\\vec{L} = \\vec{r} \\times \\vec{p} = I\\vec{\\omega}$.
- **Conservation of Angular Momentum:** If net external torque $\\tau_{ext} = 0$, then $\\vec{L}$ is conserved.""",
        "remember": {
            "question": "Define Moment of Inertia and write its SI unit. State the formulas for a disc and solid sphere.",
            "expected_answer": "Moment of Inertia (I) is the rotational analog of mass, representing a body's resistance to angular acceleration, defined as I = Σ m_i r_i². Its SI unit is kg·m². For a disc, I = 1/2 * M * R². For a solid sphere, I = 2/5 * M * R²."
        },
        "understand": {
            "question": "Explain the principle of conservation of angular momentum and explain how a ballet dancer uses it to spin faster.",
            "expected_answer": "The principle of conservation of angular momentum states that if the net external torque acting on a system is zero, the total angular momentum (L = Iω) remains constant. A ballet dancer uses this by pulling her arms and legs close to her body. This decreases her mass distribution radius, lowering her moment of inertia (I). Since L must remain constant, a decrease in I forces an increase in her angular velocity (ω), causing her to spin faster."
        },
        "apply": {
            "question": "A solid cylinder of mass 4 kg and radius 0.5 m is rotating about its central axis at 10 rad/s. Calculate its angular momentum and rotational kinetic energy.",
            "expected_answer": "First, calculate the moment of inertia for a solid cylinder: I = 1/2 * M * R² = 0.5 * 4 * (0.5)² = 2 * 0.25 = 0.5 kg·m². The angular momentum is L = I * ω = 0.5 * 10 = 5 kg·m²/s (or J·s). The rotational kinetic energy is KE_rot = 1/2 * I * ω² = 0.5 * 0.5 * (10)² = 0.25 * 100 = 25 Joules."
        }
    },
    "Gravitation": {
        "summary": """## Gravitation

**Newton's Law of Gravitation:**
- $F = G\\frac{m_1 m_2}{r^2}$ where $G = 6.67 \\times 10^{-11} \\text{ N m}^2/\\text{kg}^2$.

**Acceleration Due to Gravity ($g$):**
- At surface: $g = \\frac{GM}{R^2} \\approx 9.8 \\text{ m/s}^2$.
- At height $h$: $g_h = g\\left(1 - \\frac{2h}{R}\\right)$ (for $h \\ll R$).
- At depth $d$: $g_d = g\\left(1 - \\frac{d}{R}\\right)$.

**Gravitational Potential Energy & Potential:**
- $U = -G\\frac{Mm}{r}$.
- Escape Velocity: $v_e = \\sqrt{\\frac{2GM}{R}} = \\sqrt{2gR} \\approx 11.2 \\text{ km/s}$ (from Earth).
- Orbital Velocity: $v_o = \\sqrt{\\frac{GM}{r}} = \\sqrt{gr}$.

**Kepler's Laws:**
1. **Law of Orbits:** Planets move in elliptical orbits with the Sun at one focus.
2. **Law of Areas:** A line joining a planet and the Sun sweeps out equal areas in equal times.
3. **Law of Periods:** $T^2 \\propto a^3$ (semi-major axis).""",
        "remember": {
            "question": "State Kepler's three laws of planetary motion.",
            "expected_answer": "1. Law of Orbits: All planets move in elliptical orbits with the Sun at one of the foci. 2. Law of Areas: The line joining a planet to the Sun sweeps out equal areas in equal intervals of time. 3. Law of Periods: The square of the time period of revolution of a planet is directly proportional to the cube of the semi-major axis of its elliptical orbit (T² ∝ a³)."
        },
        "understand": {
            "question": "Explain the terms 'escape velocity' and 'orbital velocity' and derive their relationship near the Earth's surface.",
            "expected_answer": "Escape velocity (v_e) is the minimum velocity required for a body to escape a planet's gravitational field completely, given by v_e = √(2GM/R). Orbital velocity (v_o) is the horizontal velocity required to keep a satellite in circular orbit near the planet's surface, given by v_o = √(GM/R). Dividing v_e by v_o gives v_e / v_o = √(2GM/R) / √(GM/R) = √2. Therefore, escape velocity is √2 times (or roughly 1.414 times) the orbital velocity near the surface."
        },
        "apply": {
            "question": "Find the acceleration due to gravity at a height equal to the radius of the Earth (R = 6400 km) above the surface of the Earth. (g on surface = 9.8 m/s²)",
            "expected_answer": "The general formula for acceleration due to gravity at distance r from center is g_h = GM/r². At height h = R, the distance from center is r = R + h = 2R. Thus, g_h = GM/(2R)² = GM/(4R²) = 1/4 * (GM/R²) = g/4. Since g on surface is 9.8 m/s², the acceleration at height h = R is 9.8 / 4 = 2.45 m/s²."
        }
    },
    "Electrostatics": {
        "summary": """## Electrostatics

**Coulomb's Law:**
- $F = k\\frac{q_1 q_2}{r^2}$ where $k = \\frac{1}{4\\pi\\varepsilon_0} \\approx 9 \\times 10^9 \\text{ N m}^2/\\text{C}^2$.

**Electric Field ($E$):**
- Point Charge: $E = \\frac{F}{q} = k\\frac{Q}{r^2}$.
- Electric Flux: $\\Phi = \\int \\vec{E} \\cdot d\\vec{A}$.
- **Gauss's Law:** $\\Phi_{net} = \\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{enclosed}}{\\varepsilon_0}$.

**Electric Potential ($V$) & GPE:**
- $V = k\\frac{Q}{r}$, $U = k\\frac{q_1 q_2}{r}$.
- Relation: $E = -\\frac{dV}{dr}$.

**Capacitors:**
- Capacitance: $Q = CV$.
- Parallel Plate: $C = \\frac{\\varepsilon_0 A}{d}$ (with dielectric: $C = K\\frac{\\varepsilon_0 A}{d}$).
- Energy stored: $U = \\frac{1}{2}CV^2 = \\frac{Q^2}{2C}$.""",
        "remember": {
            "question": "State Gauss's Law in electrostatics and write the expression for electric field due to an infinite line charge.",
            "expected_answer": "Gauss's Law states that the net electric flux through any closed surface is equal to 1/ε₀ times the net charge enclosed by that surface (Φ = Q_enclosed / ε₀). The electric field due to an infinite line charge of linear density λ at distance r is E = λ / (2πε₀r)."
        },
        "understand": {
            "question": "Explain the concept of equipotential surfaces and list two of their key properties.",
            "expected_answer": "An equipotential surface is a surface on which the electric potential is the same at every point. Properties: (1) No work is done in moving a charge between any two points on an equipotential surface, because the potential difference is zero. (2) Electric field lines are always perpendicular to the equipotential surface at every point. If they weren't, there would be a component of electric field along the surface, which would do work, violating the definition."
        },
        "apply": {
            "question": "A parallel-plate capacitor has plates of area 0.1 m² separated by a distance of 1 mm. If a voltage of 100 V is applied, find the capacitance and the charge on each plate. (Take ε₀ = 8.85 * 10⁻¹² F/m)",
            "expected_answer": "First, calculate the capacitance: C = ε₀ * A / d = (8.85 * 10⁻¹² * 0.1) / 10⁻³ = 8.85 * 10⁻¹³ / 10⁻³ = 8.85 * 10⁻¹⁰ Farads (or 0.885 nF). Next, calculate the charge on each plate using Q = C * V: Q = 8.85 * 10⁻¹⁰ * 100 = 8.85 * 10⁻⁸ Coulombs (or 88.5 nC)."
        }
    },
    "Current Electricity": {
        "summary": """## Current Electricity

**Electric Current & Drift Velocity:**
- Current: $I = \\frac{dq}{dt} = n e A v_d$.
- Drift velocity: $v_d = \\frac{e E \\tau}{m}$ (where $\\tau$ is relaxation time).

**Ohm's Law & Resistance:**
- $V = IR$.
- Resistance: $R = \\rho\\frac{L}{A}$ (where $\\rho$ is resistivity).
- Temperature coefficient: $R_T = R_0(1 + \\alpha \\Delta T)$.

**Kirchhoff's Laws:**
1. **Kirchhoff's Current Law (KCL):** $\\sum I_{in} = \\sum I_{out}$ (Conservation of Charge).
2. **Kirchhoff's Voltage Law (KVL):** $\\sum \\Delta V = 0$ around a closed loop (Conservation of Energy).

**Wheatstone Bridge:**
- Balanced condition: $\\frac{R_1}{R_2} = \\frac{R_3}{R_4}$.""",
        "remember": {
            "question": "State Ohm's Law and define resistivity. What is the relation between current density and electric field?",
            "expected_answer": "Ohm's Law states that the current flowing through a conductor is directly proportional to the potential difference across its ends, provided temperature remains constant (V = IR). Resistivity (ρ) is the resistance of a conductor of unit length and unit cross-sectional area. The relation is J = σE, where J is current density, σ is electrical conductivity (1/ρ), and E is electric field."
        },
        "understand": {
            "question": "Explain Kirchhoff's two rules for electrical networks and state the conservation laws they are based on.",
            "expected_answer": "Kirchhoff's first rule (Current Law / Junction Rule) states that the algebraic sum of currents meeting at any junction in a network is zero. It is based on the Law of Conservation of Charge. Kirchhoff's second rule (Voltage Law / Loop Rule) states that in any closed loop of a network, the algebraic sum of potential changes is zero. It is based on the Law of Conservation of Energy."
        },
        "apply": {
            "question": "A cell of EMF 2.0 V and internal resistance 0.5 Ω is connected across an external resistor of 9.5 Ω. Calculate the current in the circuit and terminal potential difference of the cell.",
            "expected_answer": "The total resistance in the circuit is R_total = R + r = 9.5 + 0.5 = 10.0 Ω. The current in the circuit is I = EMF / R_total = 2.0 / 10 = 0.2 Amperes. The terminal potential difference of the cell is V = EMF - I * r = 2.0 - (0.2 * 0.5) = 2.0 - 0.1 = 1.9 Volts (or V = I * R = 0.2 * 9.5 = 1.9 V)."
        }
    },
    "Magnetism": {
        "summary": """## Magnetism

**Biot-Savart Law:**
- $d\\vec{B} = \\frac{\\mu_0}{4\\pi} \\frac{I (d\\vec{l} \\times \\vec{r})}{r^3}$.

**Ampere's Circuital Law:**
- $\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{enclosed}$.

**Magnetic Fields:**
- Center of circular coil: $B = \\frac{\\mu_0 I}{2R}$.
- Inside a long solenoid: $B = \\mu_0 n I$.

**Magnetic Force:**
- On moving charge: $\\vec{F} = q(\\vec{v} \\times \\vec{B})$ (Lorentz Force: $\\vec{F} = q(\\vec{E} + \\vec{v} \\times \\vec{B})$).
- On current carrying wire: $\\vec{F} = I(\\vec{L} \\times \\vec{B})$.

**Magnetic Properties:**
- Diamagnetic (rebel fields), Paramagnetic (weakly attract), Ferromagnetic (strongly attract).""",
        "remember": {
            "question": "State Ampere's Circuital Law and write the Lorentz force formula.",
            "expected_answer": "Ampere's Circuital Law states that the line integral of magnetic field B around any closed loop is equal to μ₀ times the net current passing through the loop (∮ B·dl = μ₀I). The Lorentz force formula is F = q(E + v × B), where E is the electric field and B is the magnetic field."
        },
        "understand": {
            "question": "Explain how a cyclotron accelerates charged particles and why it cannot accelerate electrons.",
            "expected_answer": "A cyclotron accelerates charged particles by sending them in a spiral path through two semi-circular hollow metal chambers ('Dees') under a perpendicular magnetic field. An alternating high-frequency electric field between the Dees accelerates the particle each time it crosses the gap. A cyclotron cannot accelerate electrons because their mass is extremely small. As they speed up, they quickly reach relativistic velocities where their mass increases, throwing them out of phase with the alternating electric field."
        },
        "apply": {
            "question": "A proton (q = 1.6 * 10⁻¹⁹ C) enters a uniform magnetic field of 0.5 T perpendicularly with a speed of 3 * 10⁶ m/s. Find the magnetic force acting on the proton. (mass = 1.67 * 10⁻²⁷ kg)",
            "expected_answer": "The magnetic force on a charge moving perpendicularly is F = q * v * B * sin(90°) = q * v * B. Plugging in values: F = (1.6 * 10⁻¹⁹ C) * (3 * 10⁶ m/s) * (0.5 T) = 1.6 * 1.5 * 10⁻¹³ = 2.4 * 10⁻¹³ Newtons."
        }
    },
    "Waves and Optics": {
        "summary": """## Waves and Optics

**Wave Motion:**
- Equation: $y(x,t) = A \\sin(kx - \\omega t + \\phi)$.
- Wave speed: $v = f\\lambda = \\frac{\\omega}{k}$.
- Speed of sound: $v = \\sqrt{\\frac{\\gamma P}{\\rho}}$ (Laplace Correction).

**Wave Optics (Interference & Diffraction):**
- Young's Double Slit Experiment (YDSE):
  - Fringe width: $\\beta = \\frac{\\lambda D}{d}$.
  - Bright fringe position: $y_n = n\\frac{\\lambda D}{d}$.

**Ray Optics:**
- Snell's Law: $n_1 \\sin i = n_2 \\sin r$.
- Lens Maker's Formula: $\\frac{1}{f} = (n - 1)\\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right)$.
- Prism Formula: $n = \\frac{\\sin((A + D_m)/2)}{\\sin(A/2)}$.""",
        "remember": {
            "question": "State Snell's Law of refraction and write the Lens Maker's Formula.",
            "expected_answer": "Snell's Law states that the ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant for a given pair of media (n₁ sin i = n₂ sin r). The Lens Maker's Formula is 1/f = (n - 1)(1/R₁ - 1/R₂), where f is the focal length, n is refractive index, and R₁, R₂ are the radii of curvature."
        },
        "understand": {
            "question": "Explain Young's Double Slit Experiment and state the conditions required to obtain sustained constructive interference.",
            "expected_answer": "Young's Double Slit Experiment demonstrates the wave nature of light by passing light from a coherent source through two closely spaced parallel slits, producing an interference pattern of alternate bright and dark fringes on a screen. For sustained constructive interference: (1) The two sources must be coherent (constant phase difference). (2) Light waves must have the same wavelength/frequency. (3) The path difference between waves must be an integral multiple of wavelength (Δ = nλ)."
        },
        "apply": {
            "question": "In a YDSE, the slit separation is 0.2 mm and the screen is placed 1.5 m away. If light of wavelength 600 nm is used, find the fringe width.",
            "expected_answer": "Fringe width is given by β = λ * D / d. Here, λ = 600 nm = 600 * 10⁻⁹ m = 6 * 10⁻⁷ m. D = 1.5 m. d = 0.2 mm = 2 * 10⁻⁴ m. Substitute values: β = (6 * 10⁻⁷ * 1.5) / (2 * 10⁻⁴) = (9 * 10⁻⁷) / (2 * 10⁻⁴) = 4.5 * 10⁻³ m = 4.5 mm."
        }
    },
    "Modern Physics": {
        "summary": """## Modern Physics

**Photoelectric Effect:**
- Einstein's Equation: $h\\nu = \\Phi + KE_{max} = h\\nu_0 + eV_0$.
- $V_0$: stopping potential, $\\Phi$: work function.

**Dual Nature of Matter:**
- de Broglie wavelength: $\\lambda = \\frac{h}{p} = \\frac{h}{mv} = \\frac{h}{\\sqrt{2mKE}}$.

**Atomic Structure (Bohr Model):**
- Angular momentum quantization: $mvr = \\frac{nh}{2\\pi}$.
- Energy levels: $E_n = -13.6\\frac{Z^2}{n^2} \\text{ eV}$.

**Nuclear Physics:**
- Radioactivity decay law: $N(t) = N_0 e^{-\\lambda t}$.
- Half-life: $T_{1/2} = \\frac{\\ln 2}{\\lambda} \\approx \\frac{0.693}{\\lambda}$.
- Mass defect & energy: $E = \\Delta m c^2$.""",
        "remember": {
            "question": "State Einstein's photoelectric equation and write the formula for de Broglie wavelength.",
            "expected_answer": "Einstein's photoelectric equation is hν = Φ + KE_max, where hν is incoming photon energy, Φ is the work function, and KE_max is maximum kinetic energy of emitted photoelectrons. The de Broglie wavelength is λ = h / p = h / (mv)."
        },
        "understand": {
            "question": "Explain Bohr's postulates for the hydrogen atom and how they resolve the instability problem of Rutherford's model.",
            "expected_answer": "Bohr's postulates: (1) Electrons revolve in specific stable circular orbits without radiating energy. (2) Angular momentum is quantized: mvr = nh/(2π). (3) Radiation is emitted/absorbed only during transitions: ΔE = hν. This resolved Rutherford's instability (where classical physics predicted revolving charges would continuously radiate energy and spiral into the nucleus) by defining discrete, non-radiating 'stationary' states below which the electron cannot fall."
        },
        "apply": {
            "question": "Calculate the de Broglie wavelength of an electron accelerated through a potential difference of 100 V. (Planck's constant h = 6.63 * 10⁻³⁴ J·s, mass of electron = 9.1 * 10⁻³¹ kg, charge = 1.6 * 10⁻¹⁹ C)",
            "expected_answer": "The kinetic energy is KE = e * V = 1.6 * 10⁻¹⁹ * 100 = 1.6 * 10⁻¹⁷ J. The momentum is p = √(2 * m * KE) = √(2 * 9.1 * 10⁻³¹ * 1.6 * 10⁻¹⁷) = √(29.12 * 10⁻⁴⁸) ≈ 5.4 * 10⁻²⁴ kg·m/s. The de Broglie wavelength is λ = h / p = (6.63 * 10⁻³⁴) / (5.4 * 10⁻²⁴) ≈ 1.23 * 10⁻¹⁰ m = 0.123 nm."
        }
    },

    # CHEMISTRY
    "Atomic Structure": {
        "summary": """## Structure of Atom

**Atomic Models & Electromagnetic Radiation:**
- Quantum nature: $E = h\\nu = \\frac{hc}{\\lambda}$.
- Photoelectric effect: $h\\nu = h\\nu_0 + \\frac{1}{2}m_e v^2$.

**Bohr Model of Hydrogen:**
- Radius of orbit: $r_n = 0.529 \\frac{n^2}{Z} \\text{ Å}$.
- Energy of orbit: $E_n = -13.6 \\frac{Z^2}{n^2} \\text{ eV/atom}$.
- Rydberg Formula: $\\frac{1}{\\lambda} = R_H Z^2 \\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)$ (where $R_H \\approx 1.0967 \\times 10^7 \\text{ m}^{-1}$).

**Quantum Mechanical Model:**
- de Broglie: $\\lambda = \\frac{h}{p}$.
- Heisenberg Uncertainty Principle: $\\Delta x \\cdot \\Delta p \\ge \\frac{h}{4\\pi}$.
- **Quantum Numbers:**
  - Principal ($n$): shell.
  - Azimuthal ($l$): subshell, $0 \\le l \\le n-1$.
  - Magnetic ($m_l$): orbital, $-l \\le m_l \\le +l$.
  - Spin ($m_s$): electron spin, $\\pm \\frac{1}{2}$.""",
        "remember": {
            "question": "State Heisenberg's Uncertainty Principle and write the values of the four quantum numbers for the valence electron of Sodium (Z=11).",
            "expected_answer": "Heisenberg's Uncertainty Principle states that it is impossible to determine simultaneously both the exact position and momentum of a subatomic particle (Δx · Δp ≥ h/4π). Sodium has configuration [Ne] 3s¹. For its valence electron, the quantum numbers are: principal (n=3), azimuthal (l=0, since it is an s subshell), magnetic (m=0), and spin (s=+1/2 or -1/2)."
        },
        "understand": {
            "question": "Explain Hund's Rule of Maximum Multiplicity and the Pauli Exclusion Principle with examples.",
            "expected_answer": "Pauli's Exclusion Principle states that no two electrons in an atom can have the exact same set of four quantum numbers, meaning each orbital holds maximum 2 electrons with opposite spins. Hund's Rule states that orbital filling in a degenerate subshell occurs singly with parallel spins first before pairing starts. For example, Nitrogen (Z=7, 2p³) has three unpaired electrons (↑ ↑ ↑), maximizing total spin multiplicity."
        },
        "apply": {
            "question": "Calculate the wavelength of the light emitted when an electron in a hydrogen atom undergoes transition from n = 3 energy level to n = 2. (R_H = 1.097 * 10⁷ m⁻¹)",
            "expected_answer": "Using Rydberg's formula: 1/λ = R_H * (1/n₁² - 1/n₂²). Here n₁ = 2, n₂ = 3. 1/λ = 1.097 * 10⁷ * (1/2² - 1/3²) = 1.097 * 10⁷ * (1/4 - 1/9) = 1.097 * 10⁷ * (5/36) = 1.097 * 10⁷ * 0.1388 ≈ 1.5236 * 10⁶ m⁻¹. Therefore, λ = 1 / (1.5236 * 10⁶) ≈ 6.56 * 10⁻⁷ meters = 656 nm (in the visible red region of Balmer series)."
        }
    },
    "Chemical Bonding": {
        "summary": """## Chemical Bonding and Molecular Structure

**Octet Rule & Lewis Symbols:**
- Elements share or transfer valence electrons to achieve noble gas configuration.

**Valence Shell Electron Pair Repulsion (VSEPR) Theory:**
- Electron pairs around a central atom repel each other.
- LP-LP > LP-BP > BP-BP.
- Shapes:
  - 2 pairs: Linear
  - 3 pairs: Trigonal Planar
  - 4 pairs: Tetrahedral
  - 5 pairs: Trigonal Bipyramidal
  - 6 pairs: Octahedral

**Hybridization:**
- Mixing of atomic orbitals to form identical hybrid orbitals.
- $sp$ (linear, $180^\\circ$), $sp^2$ (planar, $120^\\circ$), $sp^3$ (tetrahedral, $109.5^\\circ$), $sp^3d$ (trigonal bipyramidal), $sp^3d^2$ (octahedral).

**Molecular Orbital Theory (MOT):**
- Linear Combination of Atomic Orbitals (LCAO).
- Bond Order = $\\frac{N_b - N_a}{2}$ (stable if BO > 0).""",
        "remember": {
            "question": "Define ionic and covalent bond. State the balanced configuration condition in Molecular Orbital Theory.",
            "expected_answer": "An ionic bond is formed by the electrostatic attraction between oppositely charged ions created by electron transfer. A covalent bond is formed by the sharing of electron pairs. Under Molecular Orbital Theory, a molecule is stable if its bond order is greater than 0, where Bond Order = 1/2 * (N_b - N_a), where N_b is bonding electrons and N_a is antibonding electrons."
        },
        "understand": {
            "question": "Explain why H₂O has a bent shape with a bond angle of 104.5° while NH₃ has a pyramidal shape with a bond angle of 107°, despite both having sp³ hybridization.",
            "expected_answer": "Both molecules have 4 valence electron pairs, giving a basic tetrahedral electronic geometry. However, H₂O has 2 bonding pairs and 2 lone pairs on oxygen, while NH₃ has 3 bonding pairs and 1 lone pair on nitrogen. According to VSEPR theory, lone pair-lone pair (LP-LP) repulsion is stronger than lone pair-bond pair (LP-BP) and bond pair-bond pair (BP-BP) repulsions. In water, the two lone pairs compress the H-O-H bond angle down to 104.5°. In ammonia, the single lone pair compresses the H-N-H angle less, down to 107°."
        },
        "apply": {
            "question": "Using Molecular Orbital Theory, calculate the bond order and predict the magnetic behavior of O₂ and O₂⁺ molecules.",
            "expected_answer": "O₂ has 16 electrons. Configuration: σ1s² σ*1s² σ2s² σ*2s² σ2p_z² (π2p_x²=π2p_y²) (π*2p_x¹=π*2p_y¹). Bonding electrons N_b = 10, antibonding N_a = 6. Bond order = (10-6)/2 = 2. It has 2 unpaired electrons, so it is paramagnetic. O₂⁺ has 15 electrons, removing one antibonding electron (N_a = 5). Bond order = (10-5)/2 = 2.5. It has 1 unpaired electron, so it is also paramagnetic."
        }
    },
    "Thermodynamics": {
        "summary": """## Chemical Thermodynamics

**Basic Terms:**
- System, Surroundings, Boundary.
- State functions (path independent: $U, H, S, G$) vs Path functions ($q, w$).

**First Law of Thermodynamics:**
- $\\Delta U = q + w$ (where $w = -P_{ext}\\Delta V$ for expansion).

**Enthalpy ($H$):**
- $H = U + PV \\implies \\Delta H = \\Delta U + \\Delta n_g RT$.

**Entropy ($S$) and Second Law:**
- $\\Delta S = \\frac{q_{rev}}{T}$. Total entropy of universe increases in spontaneous processes.

**Gibbs Free Energy ($G$):**
- $G = H - TS \\implies \\Delta G = \\Delta H - T\\Delta S$.
- Spontaneity Conditions:
  - $\\Delta G < 0$: Spontaneous.
  - $\\Delta G > 0$: Non-spontaneous.
  - $\\Delta G = 0$: Equilibrium.""",
        "remember": {
            "question": "State the First and Second Laws of Thermodynamics, and write the Gibbs-Helmholtz equation.",
            "expected_answer": "First Law states that energy cannot be created or destroyed, only converted (ΔU = q + w). Second Law states that the entropy of the universe increases in any spontaneous process. The Gibbs-Helmholtz equation is ΔG = ΔH - TΔS."
        },
        "understand": {
            "question": "Explain the concept of state functions and path functions, giving two examples of each.",
            "expected_answer": "A state function is a property whose value depends only on the current state of the system, not on how the system reached that state. Examples are internal energy (U), enthalpy (H), entropy (S), and temperature (T). A path function is a quantity whose value depends on the specific pathway or process taken during the transition. Heat (q) and work (w) are examples."
        },
        "apply": {
            "question": "For a chemical reaction at 300 K, ΔH = -80 kJ/mol and ΔS = -200 J/(mol·K). Calculate ΔG and predict if the reaction is spontaneous.",
            "expected_answer": "First, convert ΔS to kJ: ΔS = -200 J/(mol·K) = -0.2 kJ/(mol·K). Next, use ΔG = ΔH - TΔS: ΔG = -80 - (300 * -0.2) = -80 - (-60) = -80 + 60 = -20 kJ/mol. Since ΔG (-20 kJ/mol) is negative, the reaction is spontaneous at 300 K."
        }
    },
    "Equilibrium": {
        "summary": """## Equilibrium

**Chemical Equilibrium:**
- Reversible reactions reach dynamic equilibrium when rates of forward and backward reactions are equal.
- Equilibrium Constant: $K_c = \\frac{[C]^c [D]^d}{[A]^a [B]^b}$, $K_p = K_c(RT)^{\\Delta n_g}$.
- **Le Chatelier's Principle:** If system equilibrium is disturbed, the system shifts to counteract the disturbance.

**Ionic Equilibrium:**
- **Ostwald's Dilution Law:** $\\alpha = \\sqrt{\\frac{K_a}{C}}$ (for weak electrolytes).
- **pH Concept:** $\\text{pH} = -\\log[H^+]$.
- **Buffer Solutions:** Maintain pH. Henderson-Hasselbalch: $\\text{pH} = \\text{pK}_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]}$.
- **Solubility Product ($K_{sp}$):** For $M_x A_y \\rightleftharpoons x M^{y+} + y A^{x-}$, $K_{sp} = [M^{y+}]^x [A^{x-}]^y$.""",
        "remember": {
            "question": "State Le Chatelier's Principle and write the relation between K_p and K_c.",
            "expected_answer": "Le Chatelier's Principle states that if a change in temperature, pressure, or concentration is applied to a system at equilibrium, the system will shift in a direction that tends to undo or counteract the effect of the change. The relation is K_p = K_c(RT)^(Δn_g), where Δn_g is the change in number of gaseous moles."
        },
        "understand": {
            "question": "Explain buffer action and how an acidic buffer maintains its pH when a small amount of strong acid or base is added.",
            "expected_answer": "Buffer action is the ability of a solution to resist changes in pH upon addition of small amounts of acid or base. An acidic buffer consists of a weak acid (HA) and its salt (A⁻). When H⁺ (strong acid) is added, it is consumed by the salt: H⁺ + A⁻ -> HA, preserving pH. When OH⁻ (strong base) is added, it is neutralized by the weak acid: OH⁻ + HA -> A⁻ + H₂O. Because both reactions produce weak/neutral species, pH change is minimal."
        },
        "apply": {
            "question": "Calculate the pH of a 10⁻³ M solution of a weak monobasic acid (HA) which is 10% ionized.",
            "expected_answer": "First, calculate the degree of ionization α: α = 10% = 0.10. Concentration of acid C = 10⁻³ M. The concentration of hydrogen ions [H⁺] is [H⁺] = C * α = 10⁻³ * 0.10 = 10⁻⁴ M. Now calculate the pH: pH = -log[H⁺] = -log(10⁻⁴) = 4."
        }
    },
    "Electrochemistry": {
        "summary": """## Electrochemistry

**Galvanic Cells:**
- Convert chemical energy to electrical energy.
- Cell notation: $\\text{Anode} | \\text{Anode Ion} || \\text{Cathode Ion} | \\text{Cathode}$.
- **Nernst Equation:** $E_{cell} = E^\\circ_{cell} - \\frac{0.0591}{n} \\log Q$ (at $298 \\text{ K}$).

**Free Energy and Cell Potential:**
- $\\Delta G = -n F E_{cell}$ (standard: $\\Delta G^\\circ = -n F E^\\circ_{cell}$).

**Conductance & Kohlrausch's Law:**
- Molar conductance: $\\Lambda_m = \\frac{\\kappa \\times 1000}{M}$.
- Kohlrausch's Law: $\\Lambda_m^\\infty = x \\lambda_+^\\infty + y \\lambda_-^\\infty$.

**Electrolysis:**
- Faraday's 1st Law: $w = z I t = z Q$.
- Faraday's 2nd Law: $\\frac{w_1}{w_2} = \\frac{E_1}{E_2}$.""",
        "remember": {
            "question": "State Kohlrausch's Law of independent migration of ions and Faraday's laws of electrolysis.",
            "expected_answer": "Kohlrausch's Law states that limiting molar conductivity of an electrolyte can be represented as the sum of the individual contributions of its anions and cations. Faraday's First Law: Mass of substance deposited is proportional to charge passed (w = zIt). Second Law: If same charge is passed through different cells, masses deposited are proportional to equivalent weights."
        },
        "understand": {
            "question": "Explain the working of a Galvanic cell, including anode, cathode, and salt bridge functions.",
            "expected_answer": "A Galvanic cell converts chemical energy to electrical energy through spontaneous redox reactions. In separate half-cells: Anode is the electrode where oxidation occurs (releases electrons; negative pole). Cathode is the electrode where reduction occurs (accepts electrons; positive pole). The salt bridge connects the half-cells, containing inert electrolytes to complete the circuit and maintain electrical neutrality by allowing ions to migrate between compartments."
        },
        "apply": {
            "question": "Calculate the EMF of the cell Mg(s) | Mg²⁺(0.1 M) || Cu²⁺(10⁻³ M) | Cu(s) at 298 K. Given E°(Mg²⁺/Mg) = -2.37 V and E°(Cu²⁺/Cu) = +0.34 V.",
            "expected_answer": "First, find E°_cell = E°_cathode - E°_anode = +0.34 - (-2.37) = +2.71 V. The reaction is Mg + Cu²⁺ -> Mg²⁺ + Cu (n=2). Use Nernst equation: E_cell = E°_cell - (0.0591/n) * log([Mg²⁺]/[Cu²⁺]) = 2.71 - (0.0591/2) * log(0.1 / 10⁻³) = 2.71 - 0.0295 * log(100) = 2.71 - 0.0295 * 2 = 2.71 - 0.059 = 2.651 V."
        }
    },
    "Organic Chemistry Basics": {
        "summary": """## Organic Chemistry - Some Basic Principles and Techniques

**Tetravalency of Carbon & Hybridization:**
- $sp^3$ (single bonds), $sp^2$ (double bonds), $sp$ (triple bonds).

**IUPAC Nomenclature:**
- Prefixes + Word Root + Suffixes. Principal functional group priority determines suffixes.

**Electronic Effects in Organic Molecules:**
- **Inductive Effect:** Permanent displacement of $\\sigma$ electrons along a carbon chain. (+$I$ and -$I$).
- **Resonance Effect:** Delocalization of $\\pi$ electrons ($+R$ and $-R$).
- **Hyperconjugation:** Delocalization of $\\sigma$ electrons of $C-H$ bond of an alkyl group with adjacent unsaturated system.
- **Electromeric Effect:** Temporary effect in presence of attacking reagent.

**Reactive Intermediates:**
- Carbocations (stability: tertiary > secondary > primary).
- Carbanions (stability: primary > secondary > tertiary).
- Free Radicals.""",
        "remember": {
            "question": "List the IUPAC priority order for functional groups: carboxylic acid, ketone, alcohol, aldehyde.",
            "expected_answer": "The priority order from highest to lowest is: Carboxylic acid (-COOH) > Aldehyde (-CHO) > Ketone (>C=O) > Alcohol (-OH)."
        },
        "understand": {
            "question": "Explain the Inductive Effect and contrast it with Resonance, giving an example of each.",
            "expected_answer": "The Inductive Effect is the permanent polarization of sigma bonds due to electronegativity differences, transmitting along the carbon chain. Chlorine has a -I effect (pulls electrons). Resonance involves the delocalization of pi electrons or lone pairs in conjugated systems. Aniline is stabilized by +R (nitrogen shares lone pair with ring). Distinction: Inductive is sigma-bond mediated and weakens with distance; Resonance is pi-bond mediated and doesn't weaken."
        },
        "apply": {
            "question": "Arrange the following carbocations in increasing order of stability and explain the reason: (CH₃)₃C⁺, CH₃CH₂⁺, (CH₃)₂CH⁺, CH₃⁺.",
            "expected_answer": "Increasing order: CH₃⁺ < CH₃CH₂⁺ < (CH₃)₂CH⁺ < (CH₃)₃C⁺. Explanation: Carbocations are electron-deficient. The stability is enhanced by electron-donating alkyl groups via: (1) Inductive effect (+I). (2) Hyperconjugation (number of alpha-hydrogen atoms). CH₃⁺ has 0 alpha-H; CH₃CH₂⁺ has 3; (CH₃)₂CH⁺ has 6; (CH₃)₃C⁺ has 9. More hyperconjugation structures make the tertiary carbocation the most stable."
        }
    },
    "Hydrocarbons": {
        "summary": """## Hydrocarbons

**Alkanes:**
- Saturated hydrocarbons ($C_n H_{2n+2}$).
- Halogenation: Free radical substitution (reactivity: $F_2 > Cl_2 > Br_2 > I_2$).
- **Wurtz Reaction:** $2RX + 2Na \\xrightarrow{\\text{dry ether}} R-R + 2NaX$.

**Alkenes:**
- Unsaturated ($C_n H_{2n}$).
- **Electrophilic Addition Reactions:**
  - **Markovnikov's Rule:** Negative part of addendum goes to carbon with fewer H atoms.
  - **Anti-Markovnikov's (Peroxide Effect):** Free radical addition of $HBr$ only.
  - Ozonolysis: Cleaves double bond into carbonyls.

**Alkynes:**
- Triple bonded ($C_n H_{2n-2}$). Acidic nature of terminal alkynes ($CH\\equiv CH + Na \\rightarrow CH\\equiv C^- Na^+$).

**Arenes (Aromatic):**
- Benzene: Electrophilic Aromatic Substitution (halogenation, nitration, sulfonation, Friedel-Crafts).""",
        "remember": {
            "question": "State Markovnikov's Rule and write the chemical equation for the Wurtz Reaction.",
            "expected_answer": "Markovnikov's Rule states that during electrophilic addition to an unsymmetrical alkene, the negative part of the reagent adds to the carbon atom containing the fewer number of hydrogen atoms. The Wurtz reaction equation is: 2R-X + 2Na -[dry ether]-> R-R + 2NaX."
        },
        "understand": {
            "question": "Explain ozonolysis of alkenes. What products are obtained when 2-methylbutene undergoes ozonolysis followed by zinc/water reduction?",
            "expected_answer": "Ozonolysis is a reaction where an alkene's double bond is cleaved by ozone (O₃) followed by reductive workup (Zn/H₂O) to yield aldehydes or ketones. For 2-methylbutene (CH₃-C(CH₃)=CH-CH₃): the double bond splits. The left carbon holds two methyl groups, yielding acetone (propanone). The right carbon holds a hydrogen and a methyl group, yielding acetaldehyde (ethanal). The products are propanone and ethanal."
        },
        "apply": {
            "question": "Convert Benzene into: (a) Nitrobenzene, (b) Acetophenone. Write reagents and equations.",
            "expected_answer": "(a) Nitration: Benzene + conc. HNO₃ + conc. H₂SO₄ at 50-60°C yields Nitrobenzene + H₂O. (b) Friedel-Crafts Acylation: Benzene + Acetyl chloride (CH₃COCl) in presence of anhydrous AlCl₃ yields Acetophenone (C₆H₅COCH₃) + HCl."
        }
    },
    "Biomolecules": {
        "summary": """## Biomolecules

**Carbohydrates:**
- Classification: Monosaccharides (Glucose, Fructose), Oligosaccharides, Polysaccharides (Starch, Cellulose).
- **Glucose Structure:** Alhexose. Reduces Tollens' and Fehling's reagents.
- Glycosidic Linkage: Oxide link joining two monosaccharide units.

**Proteins:**
- Polymers of $\\alpha$-amino acids joined by peptide bonds ($-CO-NH-$).
- Classification: Fibrous and Globular.
- Denaturation: Disruption of secondary/tertiary structures by heat or pH change.

**Nucleic Acids:**
- Polymers of nucleotides (Nitrogenous Base + Pentose Sugar + Phosphate).
- DNA: Deoxyribonucleic acid (bases: A, G, C, T). Double helix.
- RNA: Ribonucleic acid (bases: A, G, C, U).""",
        "remember": {
            "question": "List the four nitrogenous bases in DNA and the linkage that holds amino acids in proteins.",
            "expected_answer": "The four bases in DNA are Adenine (A), Guanine (G), Cytosine (C), and Thymine (T). In proteins, amino acids are linked together by peptide bonds (-CO-NH-)."
        },
        "understand": {
            "question": "Explain denaturation of proteins and state its structural consequences.",
            "expected_answer": "Denaturation is a process where a protein loses its native 3D structure due to physical or chemical changes like heating or pH alteration. During denaturation, the hydrogen bonds and hydrophobic interactions stabilizing the secondary, tertiary, and quaternary structures are disrupted, causing the protein globule to unfold. Importantly, the primary structure (peptide bonds) remains intact, but the biological activity is lost."
        },
        "apply": {
            "question": "An organic compound reacts with HI to give n-hexane, reacts with HCN to give a cyanohydrin, and is oxidized by bromine water to gluconic acid. Identify the compound and write these reactions.",
            "expected_answer": "The compound is Glucose (C₆H₁₂O₆). Reactions: (1) Glucose + HI + Heat -> n-hexane (confirms 6-carbon straight chain). (2) Glucose + HCN -> Glucose cyanohydrin (confirms carbonyl group). (3) Glucose + Br₂ water -> Gluconic acid (confirms carbonyl is an aldehyde group)."
        }
    },
    "Coordination Compounds": {
        "summary": """## Coordination Compounds

**Definitions:**
- Coordination sphere, Central metal, Ligands (unidentate, bidentate, polydentate like EDTA, ambidentate like $NO_2^-$/$ONO^-$).

**Valence Bond Theory (VBT):**
- Metal provides vacant orbitals matching coordination number.
- Hybridization determines geometry:
  - $sp^3$ (Tetrahedral, weak ligands)
  - $dsp^2$ (Square Planar, strong ligands)
  - $d^2sp^3$ (Inner orbital octahedral)
  - $sp^3d^2$ (Outer orbital octahedral)

**Crystal Field Theory (CFT):**
- Split $d$-orbitals into $t_{2g}$ and $e_g$.
- Strong field ligands (CN⁻, CO) cause large split $\\Delta_0 > P$ (pairing occurs; low spin).
- Weak field ligands (Cl⁻, F⁻) cause small split $\\Delta_0 < P$ (high spin).

**Isomerism:** Structural and Stereoisomerism (Geometrical, Optical).""",
        "remember": {
            "question": "Define monodentate, bidentate, and ambidentate ligands, giving an example of each.",
            "expected_answer": "Monodentate ligands coordinate through a single donor atom (e.g., Cl⁻, H₂O). Bidentate ligands bind through two donor atoms simultaneously (e.g., oxalate C₂O₄²⁻, ethylenediamine). Ambidentate ligands possess two different donor atoms but coordinate through only one at a time (e.g., thiocyanate SCN⁻ or NCS⁻, nitrite NO₂⁻ or ONO⁻)."
        },
        "understand": {
            "question": "Explain Crystal Field splitting in an octahedral field and define low spin and high spin complexes.",
            "expected_answer": "In an octahedral coordination field, the electrostatic approach of ligands splits the five degenerate d-orbitals of the central metal into two sets: three lower-energy orbitals (t_2g: d_xy, d_yz, d_zx) and two higher-energy orbitals (e_g: d_x²-y², d_z²). Strong field ligands create a large energy gap (Δ_o). If Δ_o is greater than the pairing energy (P), electrons pair up in the t_2g set first, forming low spin complexes. Weak field ligands create a small gap (Δ_o < P), so electrons fill singly across all orbitals before pairing, forming high spin complexes."
        },
        "apply": {
            "question": "For the complex [CoF₆]³⁻ (Cobalt Z=27): find the oxidation state, hybridization, geometry, and magnetic property using VBT.",
            "expected_answer": "Cobalt's oxidation state is +3, so Co³⁺ configuration is [Ar] 3d⁶. Fluoride (F⁻) is a weak field ligand and cannot pair the electrons. Thus, the 5 d-orbitals remain as: 1 paired, 4 unpaired. To accommodate 6 ligands, the metal uses outer orbitals: one 4s, three 4p, two 4d, yielding sp³d² hybridization. The geometry is octahedral. Because there are 4 unpaired electrons, the complex is highly paramagnetic (high spin)."
        }
    },
    "p-Block Elements": {
        "summary": """## p-Block Elements

**Group 13 to 18 General Trends:**
- Outermost configuration: $ns^2 np^{1-6}$.
- **Inert Pair Effect:** Reluctance of s-electrons to participate in bonding down the group, leading to stable lower oxidation states (e.g., $Pb^{2+}$ more stable than $Pb^{4+}$, $Tl^{1+}$ more stable than $Tl^{3+}$).

**Important Compounds & Anomalous Behavior:**
- **Diborane ($B_2H_6$):** 3-center-2-electron bonds (banana bonds).
- **Silicones:** Organosilicon polymers.
- **Nitrogen:** Anomalous behavior due to small size, high electronegativity, and lack of d-orbitals.
- **Phosphorus Allotropes:** White (highly reactive), Red (stable), Black.
- **Halogens:** Strong oxidizing agents. Fluorine has anomalous low electron gain enthalpy due to small size.
- **Noble Gases:** Xenon compounds ($XeF_2, XeF_4, XeF_6, XeO_3$).""",
        "remember": {
            "question": "Explain the Inert Pair Effect and write the structure/bonding of Diborane (B₂H₆).",
            "expected_answer": "The Inert Pair Effect is the reluctance of s-orbital electrons in heavier p-block elements to participate in bonding, making lower oxidation states (e.g., Pb²⁺, Tl⁺) more stable than higher ones. Diborane has 4 terminal H atoms forming 2c-2e bonds, and 2 bridging H atoms forming two 3c-2e bonds (banana bonds) with the two Boron atoms."
        },
        "understand": {
            "question": "Explain why nitrogen is diatomic gas at room temperature while phosphorus is a tetra-atomic solid.",
            "expected_answer": "Nitrogen is small and has high electronegativity, allowing it to form stable pπ-pπ triple bonds (N≡N) with itself. Due to weak van der Waals forces between individual diatomic molecules, it exists as a gas. Phosphorus has a larger atomic size and weaker pπ-pπ overlap, preventing triple bond formation. Instead, it forms single covalent bonds in a tetrahedral tetrahedral structure (P₄), resulting in a solid state with higher intermolecular forces."
        },
        "apply": {
            "question": "Predict the shapes of XeF₂, XeF₄, and XeO₃ molecules using VSEPR theory.",
            "expected_answer": "XeF₂: Xe has 8 valence electrons + 2 fluorine atoms = 5 electron pairs (2 bonding, 3 lone pairs). Hybridization sp³d. The 3 lone pairs occupy equatorial positions, so the shape is Linear. XeF₄: 8 + 4 = 6 pairs (4 bonding, 2 lone pairs). Hybridization sp³d². The 2 lone pairs occupy axial positions, yielding Square Planar geometry. XeO₃: 8 valence electrons; oxygen forms double bonds. There are 3 bond pairs (double bonds) + 1 lone pair. Shape is Trigonal Pyramidal."
        }
    },

    # MATHEMATICS
    "Sets, Relations and Functions": {
        "summary": """## Sets, Relations and Functions

**Sets:**
- Operations: Union ($A \\cup B$), Intersection ($A \\cap B$), Complement ($A'$), Difference ($A-B$).
- **De Morgan's Laws:** $(A \\cup B)' = A' \\cap B'$, $(A \\cap B)' = A' \\cup B'$.

**Relations:**
- A subset of $A \\times B$.
- **Types of Relations (on Set A):**
  - **Reflexive:** $(a, a) \\in R$ for all $a \\in A$.
  - **Symmetric:** $(a, b) \\in R \\implies (b, a) \\in R$.
  - **Transitive:** $(a, b), (b, c) \\in R \\implies (a, c) \\in R$.
  - **Equivalence:** Reflexive + Symmetric + Transitive.

**Functions:**
- Mapping $f: A \\rightarrow B$.
- **One-One (Injective):** $f(x_1) = f(x_2) \\implies x_1 = x_2$.
- **Onto (Surjective):** Range = Codomain (for every $y \\in B$, $\\exists x \\in A$ such that $f(x) = y$).
- **Bijective:** Injective + Surjective (invertible).""",
        "remember": {
            "question": "Define reflexive, symmetric, and transitive relations. State De Morgan's laws.",
            "expected_answer": "A relation R on set A is: (1) Reflexive if (a,a) ∈ R for all a ∈ A. (2) Symmetric if (a,b) ∈ R implies (b,a) ∈ R. (3) Transitive if (a,b) ∈ R and (b,c) ∈ R implies (a,c) ∈ R. De Morgan's laws: (A ∪ B)' = A' ∩ B' and (A ∩ B)' = A' ∪ B'."
        },
        "understand": {
            "question": "Explain the conditions for a function to be invertible and discuss why f: ℝ→ℝ defined by f(x) = x² is not invertible.",
            "expected_answer": "A function is invertible if and only if it is a bijection (both one-one and onto). The function f(x) = x² on real numbers is not one-one because different inputs yield same output, e.g., f(-2) = f(2) = 4. It is also not onto because negative real numbers in the codomain have no real pre-image (square of any real number is non-negative). Thus it is not bijective and not invertible."
        },
        "apply": {
            "question": "Let A = {1, 2, 3}. Define a relation R = {(1,1), (2,2), (3,3), (1,2), (2,1)}. Determine if R is an equivalence relation.",
            "expected_answer": "1. Reflexive: (1,1), (2,2), (3,3) are in R. So R is reflexive. 2. Symmetric: (1,2) ∈ R and (2,1) ∈ R. Every element (a,b) has (b,a) in R. So R is symmetric. 3. Transitive: We check transitivity. (1,2) and (2,1) are in R, and (1,1) is in R. (2,1) and (1,2) are in R, and (2,2) is in R. There are no violations. R is transitive. Since R is reflexive, symmetric, and transitive, it is an equivalence relation."
        }
    },
    "Complex Numbers": {
        "summary": """## Complex Numbers

**Definition:**
- $z = x + iy$ (where $x = \\text{Re}(z)$, $y = \\text{Im}(z)$, and $i = \\sqrt{-1}$).

**Modulus & Argument:**
- Modulus: $|z| = \\sqrt{x^2 + y^2}$.
- Principal Argument: $\\theta = \\tan^{-1}\\left(\\frac{y}{x}\\right)$ adjusted for quadrant ($-\\pi < \\theta \\le \\pi$).
- Polar Form: $z = r(\\cos \\theta + i \\sin \\theta) = r e^{i\\theta}$.

**De Moivre's Theorem:**
- $(\\cos \\theta + i \\sin \\theta)^n = \\cos(n\\theta) + i \\sin(n\\theta)$.

**Cube Roots of Unity:**
- $z^3 = 1 \\implies z = 1, \\omega, \\omega^2$.
- $\\omega = -\\frac{1}{2} + i\\frac{\\sqrt{3}}{2} = e^{i\\frac{2\\pi}{3}}$.
- Properties: $1 + \\omega + \\omega^2 = 0$ and $\\omega^3 = 1$.""",
        "remember": {
            "question": "State De Moivre's Theorem and write the polar representation form of a complex number.",
            "expected_answer": "De Moivre's Theorem states that for any rational number n, (cos θ + i sin θ)^n = cos(nθ) + i sin(nθ). The polar representation of z = x + iy is z = r(cos θ + i sin θ), where r = |z| is the modulus and θ is the argument."
        },
        "understand": {
            "question": "Explain the geometric meaning of multiplying a complex number by imaginary unit i, and finding the distance between two complex numbers.",
            "expected_answer": "Multiplying a complex number z by i rotates its vector in the Argand plane by 90° (π/2 radians) counterclockwise. Finding the distance between two complex numbers z₁ and z₂ is represented geometrically by the modulus |z₁ - z₂|, which corresponds to the standard Euclidean distance between the points (x₁,y₁) and (x₂,y₂) in the plane."
        },
        "apply": {
            "question": "Express the complex number z = 1 + i√3 in polar form and find its square roots.",
            "expected_answer": "First, find modulus r: r = √(1² + (√3)²) = √4 = 2. Argument θ: tan(θ) = √3/1 -> θ = π/3. Polar form is z = 2(cos(π/3) + i sin(π/3)) = 2e^(iπ/3). The square roots are given by w_k = √2 * e^(i(π/3 + 2kπ)/2) for k=0,1. For k=0: w₀ = √2 * e^(iπ/6) = √2(cos(π/6) + i sin(π/6)) = √2(√3/2 + i/2) = √6/2 + i√2/2. For k=1: w₁ = -w₀ = -√6/2 - i√2/2."
        }
    },
    "Quadratic Equations": {
        "summary": """## Quadratic Equations

**Standard Form:**
- $ax^2 + bx + c = 0$ (roots: $\\alpha, \\beta = \\frac{-b \\pm \\sqrt{D}}{2a}$ where $D = b^2 - 4ac$).

**Nature of Roots (Real coefficients):**
- $D > 0$: Real and distinct.
- $D = 0$: Real and equal.
- $D < 0$: Complex conjugate roots.

**Relation Between Roots & Coefficients:**
- Sum of roots: $\\alpha + \\beta = -\\frac{b}{a}$.
- Product of roots: $\\alpha\\beta = \\frac{c}{a}$.
- Equation form: $x^2 - (\\alpha + \\beta)x + \\alpha\\beta = 0$.

**Common Roots Condition:**
- One root common: $(a_1 c_2 - a_2 c_1)^2 = (a_1 b_2 - a_2 b_1)(b_1 c_2 - b_2 c_1)$.""",
        "remember": {
            "question": "Write the quadratic formula and state the relations between roots and coefficients.",
            "expected_answer": "For ax² + bx + c = 0, roots are x = [-b ± √(b² - 4ac)] / (2a). The sum of roots is α + β = -b/a. The product of roots is αβ = c/a."
        },
        "understand": {
            "question": "Explain how the discriminant D determines the nature of the roots of a quadratic equation with real coefficients.",
            "expected_answer": "The discriminant D = b² - 4ac determines the term inside the square root in the quadratic formula. If D > 0, the square root yields a real positive number, giving two distinct real roots. If D = 0, the square root is zero, merging the two roots into one real value (-b/2a). If D < 0, the square root yields an imaginary number, producing two complex conjugate roots."
        },
        "apply": {
            "question": "Find the values of k for which the quadratic equation x^2 - 2(k - 1)x + (k + 5) = 0 has equal roots.",
            "expected_answer": "For equal roots, discriminant D = 0. Here a = 1, b = -2(k-1), c = k+5. D = b² - 4ac = [-2(k-1)]² - 4(1)(k+5) = 4(k-1)² - 4(k+5) = 4[k² - 2k + 1 - k - 5] = 4(k² - 3k - 4). Set D = 0 -> k² - 3k - 4 = 0 -> (k-4)(k+1) = 0. Therefore, k = 4 or k = -1."
        }
    },
    "Permutations and Combinations": {
        "summary": """## Permutations and Combinations

**Fundamental Principles of Counting:**
- **Addition Principle:** Independent choices ($m + n$).
- **Multiplication Principle:** Sequential choices ($m \\times n$).

**Permutations ($^n P_r$):**
- Arranging $r$ objects out of $n$ distinct objects. $^nP_r = \\frac{n!}{(n-r)!}$.
- Circular Permutations: $(n-1)!$ (if clockwise/counterclockwise are same: $\\frac{(n-1)!}{2}$).

**Combinations ($^n C_r$):**
- Selecting $r$ objects out of $n$ distinct objects. $^nC_r = \\frac{n!}{r!(n-r)!}$.
- Properties: $^nC_r = ^nC_{n-r}$, $^nC_r + ^nC_{r-1} = ^{n+1}C_r$.""",
        "remember": {
            "question": "Write the formulas for nPr and nCr, and state Pascal's identity for combinations.",
            "expected_answer": "nPr = n! / (n-r)!. nCr = n! / [r!(n-r)!]. Pascal's identity is nCr + nC(r-1) = (n+1)Cr."
        },
        "understand": {
            "question": "Explain the difference between a permutation and a combination, illustrating with a real-life example.",
            "expected_answer": "Permutation is the arrangement of objects where order is important. For example, selecting a President and Secretary from a group of 3 people is a permutation because roles (order) matter. Combination is the selection of objects where order is not important. For example, choosing a committee of 2 people from a group of 3 is a combination because the order of selection doesn't change the committee's identity."
        },
        "apply": {
            "question": "Out of 7 men and 4 ladies, a committee of 5 is to be formed. In how many ways can this be done so as to include at least 3 ladies?",
            "expected_answer": "We need to select 5 people with at least 3 ladies. Case 1: 3 ladies and 2 men. Ways: ⁴C₃ * ⁷C₂ = 4 * 21 = 84. Case 2: 4 ladies and 1 man. Ways: ⁴C₄ * ⁷C₁ = 1 * 7 = 7. (No Case 3 since there are only 4 ladies). Total ways = 84 + 7 = 91 ways."
        }
    },
    "Binomial Theorem": {
        "summary": """## Binomial Theorem

**Binomial Expansion (for positive integer $n$):**
- $(x + a)^n = \\sum_{r=0}^n {^nC_r} x^{n-r} a^r$.

**General Term ($T_{r+1}$):**
- $T_{r+1} = {^nC_r} x^{n-r} a^r$.

**Middle Term(s):**
- If $n$ is even: $\\left(\\frac{n}{2} + 1\\right)$-th term.
- If $n$ is odd: $\\left(\\frac{n+1}{2}\\right)$-th and $\\left(\\frac{n+3}{2}\\right)$-th terms.

**Binomial Coefficients Properties:**
- $C_0 + C_1 + C_2 + \\dots + C_n = 2^n$.
- $C_0 + C_2 + C_4 + \\dots = C_1 + C_3 + C_5 + \\dots = 2^{n-1}$.""",
        "remember": {
            "question": "State the Binomial Theorem expansion for (x + y)^n and write the formula for the general term.",
            "expected_answer": "(x + y)^n = nC₀ x^n + nC₁ x^(n-1) y + ... + nCn y^n. The general term is T_(r+1) = nCr * x^(n-r) * y^r."
        },
        "understand": {
            "question": "Explain how to find the term independent of x in a binomial expansion, giving the method.",
            "expected_answer": "To find the term independent of x in the expansion of (ax^p + b/x^q)^n: first write the general term T_(r+1) = nCr * (ax^p)^(n-r) * (b/x^q)^r. Simplify the expression to combine all exponents of x into a single power, say x^(p(n-r) - qr). To make it independent of x, set this exponent to 0: p(n-r) - qr = 0, and solve for r. Using this integer r, compute T_(r+1)."
        },
        "apply": {
            "question": "Find the term independent of x in the expansion of (x² + 3/x)¹⁵.",
            "expected_answer": "Write general term: T_(r+1) = ¹⁵C_r * (x²)^(15-r) * (3/x)^r = ¹⁵C_r * x^(30-2r) * 3^r * x^(-r) = ¹⁵C_r * 3^r * x^(30-3r). For term independent of x, set power of x to 0: 30 - 3r = 0 -> r = 10. The term independent of x is T₁₁ = ¹⁵C₁₀ * 3¹⁰ = (15! / (10! * 5!)) * 3¹⁰ = 3003 * 59049 = 177,324,147."
        }
    },
    "Limits, Continuity and Differentiability": {
        "summary": """## Limits, Continuity and Differentiability

**Limits:**
- L'Hopital's Rule: If $\\lim \\frac{f(x)}{g(x)}$ is $\\frac{0}{0}$ or $\\frac{\\infty}{\\infty}$, then $\\lim \\frac{f(x)}{g(x)} = \\lim \\frac{f'(x)}{g'(x)}$.
- Standard limits: $\\lim_{x\\rightarrow 0}\\frac{\\sin x}{x} = 1$, $\\lim_{x\\rightarrow 0}\\frac{e^x - 1}{x} = 1$.

**Continuity:**
- A function $f(x)$ is continuous at $x = c$ iff:
  - $\\lim_{x\\rightarrow c^-} f(x) = \\lim_{x\\rightarrow c^+} f(x) = f(c)$.

**Differentiability:**
- $f(x)$ is differentiable at $x = c$ iff Left Hand Derivative (LHD) = Right Hand Derivative (RHD).
- $\\text{LHD} = \\lim_{h\\rightarrow 0} \\frac{f(c) - f(c-h)}{h}$, $\\text{RHD} = \\lim_{h\\rightarrow 0} \\frac{f(c+h) - f(c)}{h}$.
- Note: Differentiability $\\implies$ Continuity, but not vice-versa (e.g., $f(x) = |x|$ at $x=0$).""",
        "remember": {
            "question": "State the limit definitions for continuity and differentiability at a point x = c.",
            "expected_answer": "Continuity: f(x) is continuous at x=c if lim_(x->c) f(x) = f(c), meaning LHL = RHL = f(c). Differentiability: f(x) is differentiable at x=c if the limit lim_(h->0) [f(c+h) - f(c)]/h exists and is finite."
        },
        "understand": {
            "question": "Explain why differentiability implies continuity, but continuity does not imply differentiability, citing a standard counterexample.",
            "expected_answer": "If f(x) is differentiable, it has a defined tangent slope, which requires the graph to be smooth and unbroken (continuous). If a function is continuous, it has no breaks, but it can still have sharp corners. At a sharp corner, the tangent slope cannot be uniquely defined. An example is f(x) = |x| at x=0. It is continuous at x=0 (graph is connected), but not differentiable because LHD = -1 and RHD = 1."
        },
        "apply": {
            "question": "Evaluate the limit: lim_(x->0) [e^x - cos(x) - x] / x².",
            "expected_answer": "As x->0, the limit is of form (1 - 1 - 0)/0 = 0/0. Apply L'Hopital's Rule: Differentiate numerator: e^x + sin(x) - 1. Differentiate denominator: 2x. The new limit is lim_(x->0) [e^x + sin(x) - 1] / 2x. This is still 0/0 form. Apply L'Hopital's Rule again: Differentiate numerator: e^x + cos(x). Differentiate denominator: 2. The limit is lim_(x->0) [e^x + cos(x)] / 2 = (1 + 1)/2 = 1."
        }
    },
    "Application of Derivatives": {
        "summary": """## Application of Derivatives (AOD)

**Rate of Change:**
- $\\frac{dy}{dx}$ is the rate of change of $y$ with respect to $x$.

**Tangents and Normals:**
- Slope of tangent: $m = f'(x_0)$.
- Equation: $y - y_0 = f'(x_0)(x - x_0)$.
- Slope of normal: $m_n = -\\frac{1}{f'(x_0)}$.

**Monotonicity:**
- Increasing if $f'(x) \\ge 0$.
- Decreasing if $f'(x) \\le 0$.

**Maxima and Minima:**
- First Derivative Test: Critical points where $f'(c) = 0$.
- Second Derivative Test:
  - $f''(c) < 0$: Local Maxima.
  - $f''(c) > 0$: Local Minima.
  - $f''(c) = 0$: Test fails (use first derivative test).""",
        "remember": {
            "question": "State the second derivative test criteria for local maxima and local minima at a critical point x = c.",
            "expected_answer": "First, find critical points where f'(c) = 0. The Second Derivative Test states: (1) If f''(c) < 0, then f has a local maximum at x=c. (2) If f''(c) > 0, then f has a local minimum at x=c. (3) If f''(c) = 0, the test is inconclusive."
        },
        "understand": {
            "question": "Explain Rolles' Theorem and mean value theorem, detailing their geometric interpretations.",
            "expected_answer": "Rolle's Theorem states that if f is continuous on [a,b] and differentiable on (a,b), and f(a)=f(b), there exists c ∈ (a,b) where f'(c)=0 (horizontal tangent). Mean Value Theorem removes f(a)=f(b) condition, stating there is a c where f'(c) = [f(b)-f(a)]/(b-a). Geometrically, this means there is at least one point where the tangent is parallel to the secant line joining endpoints."
        },
        "apply": {
            "question": "Find the maximum and minimum values of the function f(x) = 2x³ - 15x² + 36x + 10 on the interval [0, 4].",
            "expected_answer": "Find f'(x) = 6x² - 30x + 36. Set f'(x) = 0 -> 6(x² - 5x + 6) = 0 -> (x-2)(x-3) = 0. Critical points: x = 2, x = 3. Evaluate f(x) at critical points and endpoints: f(0) = 10; f(2) = 16 - 60 + 72 + 10 = 38; f(3) = 54 - 135 + 108 + 10 = 37; f(4) = 128 - 240 + 144 + 10 = 42. Thus, the maximum value is 42 (at x=4) and the minimum value is 10 (at x=0)."
        }
    },
    "Integral Calculus": {
        "summary": """## Integral Calculus

**Indefinite Integrals:**
- Integration is reverse process of differentiation.
- Substitutions: e.g., $x = a \\sin \\theta$ for $\\sqrt{a^2 - x^2}$.
- Integration by Parts: $\\int u dv = uv - \\int v du$.

**Definite Integrals Properties:**
1. $\\int_a^b f(x) dx = \\int_a^b f(a+b-x) dx$ (King's Property).
2. $\\int_0^{2a} f(x) dx = 2\\int_0^a f(x) dx$ if $f(2a-x) = f(x)$, else $0$ if $f(2a-x) = -f(x)$.
3. $\\int_{-a}^a f(x) dx = 2\\int_0^a f(x) dx$ if $f(x)$ is even, else $0$ if $f(x)$ is odd.

**Area Under Curves:**
- $A = \\int_a^b y dx$ (between curve $y=f(x)$, x-axis, and lines $x=a, x=b$).""",
        "remember": {
            "question": "State the integration-by-parts formula and write King's property of definite integrals.",
            "expected_answer": "Integration by parts: ∫ u dv = uv - ∫ v du (commonly chosen via ILATE rule). King's property: ∫_a^b f(x) dx = ∫_a^b f(a + b - x) dx."
        },
        "understand": {
            "question": "Explain the geometric meaning of a definite integral and how to find the area bounded between two intersecting curves.",
            "expected_answer": "The definite integral ∫_a^b f(x) dx represents the net signed area bounded between the curve y = f(x), the x-axis, and vertical lines x = a and x = b. To find the area between two curves y = f(x) and y = g(x) intersecting at x=a and x=b, we integrate the absolute difference of the functions: Area = ∫_a^b |f(x) - g(x)| dx, which is effectively integrating (upper curve - lower curve)."
        },
        "apply": {
            "question": "Evaluate the definite integral: ∫₀^(π/2) [ sin(x) / (sin(x) + cos(x)) ] dx.",
            "expected_answer": "Let I = ∫₀^(π/2) [ sin(x) / (sin(x) + cos(x)) ] dx. Apply King's property (replace x with π/2 - x): I = ∫₀^(π/2) [ sin(π/2 - x) / (sin(π/2 - x) + cos(π/2 - x)) ] dx = ∫₀^(π/2) [ cos(x) / (cos(x) + sin(x)) ] dx. Add both equations: 2I = ∫₀^(π/2) [ (sin(x) + cos(x)) / (sin(x) + cos(x)) ] dx = ∫₀^(π/2) 1 dx = [x]₀^(π/2) = π/2. Therefore, 2I = π/2 -> I = π/4."
        }
    },
    "Differential Equations": {
        "summary": """## Differential Equations

**Order and Degree:**
- **Order:** Highest derivative present.
- **Degree:** Power of highest derivative (when differential equation is polynomial in derivatives).

**Methods of Solution (First Order):**
1. **Variable Separable:** $f(x)dx = g(y)dy \\implies \\int f(x)dx = \\int g(y)dy$.
2. **Homogeneous:** Substitute $y = vx$.
3. **Linear Differential Equation ($dy/dx + Py = Q$):**
   - Integrating Factor: $IF = e^{\\int P dx}$.
   - Solution: $y \\cdot IF = \\int (Q \\cdot IF) dx + C$.

**Application (Population growth, decay):**
- $\\frac{dy}{dx} = ky$.""",
        "remember": {
            "question": "Define order and degree of a differential equation. Write the integrating factor formula for dy/dx + Py = Q.",
            "expected_answer": "The order of a differential equation is the order of the highest derivative occurring in it. The degree is the power of the highest derivative (when written as a polynomial in derivatives). For dy/dx + Py = Q, the integrating factor is IF = e^(∫ P dx)."
        },
        "understand": {
            "question": "Explain the concept of homogenous differential equations and the substitution method used to solve them.",
            "expected_answer": "A differential equation of the form dy/dx = f(x,y) is homogeneous if f(x,y) is a homogeneous function of degree zero, meaning f(λx, λy) = f(x,y). To solve, we substitute y = vx (where v is a function of x). Differentiating gives dy/dx = v + x(dv/dx). Substituting this back transforms the equation into a separable variable form in terms of v and x, which can then be solved by integration."
        },
        "apply": {
            "question": "Solve the differential equation: dy/dx + 2y = e^(-x).",
            "expected_answer": "This is a linear differential equation of the form dy/dx + Py = Q, where P = 2 and Q = e^(-x). Find the integrating factor: IF = e^(∫ 2 dx) = e^(2x). Multiply both sides and solve: y * e^(2x) = ∫ e^(-x) * e^(2x) dx = ∫ e^x dx = e^x + C. Solve for y: y = (e^x + C) * e^(-2x) = e^(-x) + C*e^(-2x)."
        }
    },
    "Vectors and 3D Geometry": {
        "summary": """## Vector Algebra and Three Dimensional Geometry

**Vector Operations:**
- **Dot Product:** $\\vec{a} \\cdot \\vec{b} = a b \\cos \\theta$ (Scalar, zero if perpendicular).
- **Cross Product:** $\\vec{a} \\times \\vec{b} = (a b \\sin \\theta) \\hat{n}$ (Vector perpendicular to both).
- Scalar Triple Product: $[\\vec{a}\\ \\vec{b}\\ \\vec{c}] = \\vec{a} \\cdot (\\vec{b} \\times \\vec{c})$.

**3D Lines:**
- Vector Equation: $\\vec{r} = \\vec{a} + \\lambda \\vec{b}$.
- Cartesian: $\\frac{x-x_1}{a} = \\frac{y-y_1}{b} = \\frac{z-z_1}{c}$.

**3D Planes:**
- Vector Equation: $\\vec{r} \\cdot \\vec{n} = d$.
- Cartesian: $ax + by + cz + d = 0$.

**Angle & Distance:**
- Distance between skew lines: $d = \\frac{|(\\vec{a}_2 - \\vec{a}_1) \\cdot (\\vec{b}_1 \\times \\vec{b}_2)|}{|\\vec{b}_1 \\times \\vec{b}_2|}$.""",
        "remember": {
            "question": "Write the vector equation of a line passing through a point 'a' and parallel to vector 'b', and write the skew line distance formula.",
            "expected_answer": "The vector equation of the line is r = a + λb. The shortest distance d between two skew lines r = a₁ + λb₁ and r = a₂ + μb₂ is d = |(a₂ - a₁) · (b₁ × b₂)| / |b₁ × b₂|."
        },
        "understand": {
            "question": "Explain dot and cross products of vectors, including physical meaning and orthogonality/collinearity criteria.",
            "expected_answer": "Dot product (a·b) yields a scalar, physically representing projection of one vector on another. If a·b = 0, vectors are orthogonal. Cross product (a×b) yields a vector perpendicular to both, physically representing the area vector of a parallelogram. If a×b = 0, vectors are collinear. Dot product uses cos θ; cross product uses sin θ."
        },
        "apply": {
            "question": "Find the angle between the two lines: r = (i + j) + λ(i + 2j - k) and r = (i + j) + μ(2i + j + 2k).",
            "expected_answer": "The direction vectors of the lines are b₁ = i + 2j - k and b₂ = 2i + j + 2k. The angle θ is given by cos θ = |b₁ · b₂| / (|b₁| * |b₂|). b₁ · b₂ = (1*2) + (2*1) + (-1*2) = 2 + 2 - 2 = 2. |b₁| = √(1² + 2² + (-1)²) = √6. |b₂| = √(2² + 1² + 2²) = √9 = 3. cos θ = 2 / (3 * √6) = 2 / (3√6). Therefore, θ = arccos(2 / 3√6) ≈ 74.2°."
        }
    }
}

def seed_curriculum():
    print(f"[*] Connecting to SQLite database at {DB_PATH}...")
    if not os.path.exists(DB_PATH):
        print(f"[-] Database file not found at {DB_PATH}")
        sys.exit(1)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    print("[*] Seeding summaries and questions for the 30 topics...")
    topics_updated = 0
    questions_seeded = 0
    
    for title, data in CURRICULUM.items():
        # 1. Update summary for this topic
        # Get topic id by title
        cursor.execute("SELECT id FROM topics WHERE title = ?", (title,))
        row = cursor.fetchone()
        if not row:
            print(f"  [-] Topic '{title}' not found in database. Skipping.")
            continue
        
        topic_id = row[0]
        cursor.execute("UPDATE topics SET summary = ? WHERE id = ?", (data["summary"], topic_id))
        topics_updated += 1
        
        # 2. Insert or update questions for this topic
        if "questions" in data:
            # Delete attempts referencing these questions first to avoid FK constraint errors
            cursor.execute("SELECT id FROM questions WHERE topic_id = ?", (topic_id,))
            q_ids = [r[0] for r in cursor.fetchall()]
            if q_ids:
                q_placeholders = ",".join(["?"] * len(q_ids))
                cursor.execute(f"DELETE FROM attempts WHERE question_id IN ({q_placeholders})", q_ids)
            
            # Now delete the questions
            cursor.execute("DELETE FROM questions WHERE topic_id = ?", (topic_id,))
            
            # Insert new questions
            for q_data in data["questions"]:
                q_id = uuid.uuid4().hex
                cursor.execute("""
                    INSERT INTO questions (id, topic_id, question_text, expected_answer, bloom_level, created_by, is_validated, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (q_id, topic_id, q_data["question"], q_data["expected_answer"], q_data["bloom_level"], "tutor", 1, 1, datetime.utcnow().isoformat()))
                questions_seeded += 1
        else:
            levels = ["remember", "understand", "apply"]
            for level in levels:
                q_text = data[level]["question"]
                ans_text = data[level]["expected_answer"]
                
                # Check if a question for this topic and bloom level already exists
                cursor.execute("SELECT id FROM questions WHERE topic_id = ? AND bloom_level = ?", (topic_id, level))
                q_row = cursor.fetchone()
                if q_row:
                    q_id = q_row[0]
                    cursor.execute("""
                        UPDATE questions 
                        SET question_text = ?, expected_answer = ?, created_by = ?, is_validated = ?, is_active = ?
                        WHERE id = ?
                    """, (q_text, ans_text, "tutor", 1, 1, q_id))
                else:
                    q_id = uuid.uuid4().hex
                    cursor.execute("""
                        INSERT INTO questions (id, topic_id, question_text, expected_answer, bloom_level, created_by, is_validated, is_active, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (q_id, topic_id, q_text, ans_text, level, "tutor", 1, 1, datetime.utcnow().isoformat()))
                questions_seeded += 1
            
    conn.commit()
    conn.close()
    print(f"[*] Successfully updated {topics_updated} topics with summaries.")
    print(f"[*] Successfully seeded {questions_seeded} fixed questions.")

if __name__ == "__main__":
    seed_curriculum()

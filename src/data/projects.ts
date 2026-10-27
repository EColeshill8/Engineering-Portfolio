export type MediaCredit = { label: string; url: string };
export type Photo = { key: string; alt: string; caption: string; position?: string; kind?: 'logo' | 'logo-dark'; credit?: MediaCredit; referenceLabel?: string };
export type ReferenceMedia = {
  notice: string; photos: Photo[];
  video: { id: string; title: string; poster: string; caption: string; credit: MediaCredit };
};
export type StorySection = { title: string; paragraphs: string[] };
export type Project = {
  slug: string; title: string; subtitle: string; category: string; year: string;
  role: string; status: string; tone?: 'progress' | 'award'; tags: string[];
  cover?: Photo; summary: string; context: string; contributions: string[];
  sections: StorySection[]; outcome: { title: string; text: string };
  gallery: Photo[]; model?: string; video?: string; referenceMedia?: ReferenceMedia; related: string[];
};

export const projects: Project[] = [
  {
    slug: 'baker-bot', title: 'Baker Bot', subtitle: 'A robot with something to say.',
    category: 'Robotics', year: 'April 2026–present', role: 'Project lead · Head development',
    status: 'Software integration in progress', tone: 'progress',
    tags: ['System integration', 'Mechanical design', 'Team leadership'],
    cover: {key: 'baker-bot', alt: 'The waist-up Baker Bot on a workbench, with its head, arms and control electronics assembled.', caption: 'Baker Bot during assembly. The hardware is complete; coordinated software is still being integrated.', position: '50% 31%'},
    summary: 'Leading a 12-person student build of an AI-enabled co-lecturer for Professor Baker, while independently developing the robot’s expressive head.',
    context: 'The goal is a teaching tool that Professor Baker can talk to and play off during lectures. An AI response will be accompanied by gestures and facial movement suited to its context and tone.',
    contributions: ['Organize the subteams, team leads and overall integration.', 'Develop the head’s jaw and blinking-eyelid mechanisms.', 'Coordinate mechanical, electrical and software interfaces across a distributed team.', 'Write a small amount of embedded code to move the head components.'],
    sections: [
      {title: 'Making room for expression', paragraphs: ['The head needed room for its actuators without changing its proportions. The jaw was especially difficult: its desired rotation point was inside the mouth cavity, where placing a servo would obstruct the mouth.', 'I offset the jaw motor with a herringbone-gear drive. That freed the cavity and allowed a gear ratio instead of direct drive. I used a third-party SolidWorks gear generator for the gear geometry and designed the mechanism around the available space. Small SG90 servos move the eyelids through paperclip linkages connected to their horns.']},
      {title: 'Designing separately, assembling together', paragraphs: ['Our team lived across Ontario, so the subsystems had to meet at the end of the summer. Detailed CAD and advance electronics planning helped us work through interfaces before final assembly. Each team proved out its own subsystem before bringing the pieces together.', 'My role reaches across those interfaces: understanding how the mechanical assemblies, power electronics and controllers fit together, keeping the leads aligned, and working through integration problems with them.']},
      {title: 'The remaining integration', paragraphs: ['The robot has motorized elbows, neck rotation and multidirectional tilt, a jaw and eyelids. Its hardware combines a Jetson, ESP32 control and custom PCBs. Mechanical and electrical work is complete, and the subsystems work separately.', 'The remaining work connects embedded motor control, gesture scheduling and emotional/context cues from the cloud AI. My personal programming contribution so far is limited to head-movement methods; the wider software pipeline is a team effort and is not yet a finished demonstration.']}
    ],
    outcome: {title: 'Hardware complete. Integration continues.', text: 'The built subsystems are working individually. Coordinated movement and AI-driven context-to-gesture control remain in progress, so the intended co-lecturer behaviour is still a development goal.'},
    gallery: [{key: 'baker-head', alt: 'The Baker Bot head held in a hand, showing the cavity and internal mechanisms.', caption: 'The head I developed, with its jaw and eyelid hardware packaged inside the original proportions.'}],
    model: 'baker-bot', related: ['ri3d', 'weather-lights', 'robotics-teaching']
  },
  {
    slug: 'combat-robotics', title: 'Combat robotics', subtitle: 'Helping two teams find their own solutions.',
    category: 'Robotics', year: 'September 2026–present', role: 'WE FIRST president · Technical mentorship',
    status: 'In design', tone: 'progress', tags: ['Design reviews', 'Manufacturing', 'Mentorship'],
    cover: {key: 'botbrawl-logo', alt: 'BotBrawl Canada logo.', caption: 'BotBrawl Canada is the competition our teams are designing for. WE FIRST’s robots are still in design.', kind: 'logo-dark', credit: {label: 'Logo: BotBrawl Canada', url: 'https://botbrawl.ca/'}, referenceLabel: 'Competition reference'},
    summary: 'Supporting two teams designing 3 lb robots for Bot Brawl, with guidance on materials, drive arrangements, weapon design and manufacturing.',
    context: 'Combat robotics is part of WE FIRST, the university club I lead. Marc leads the combat project itself. My role is to support both robot teams and help their members develop sound designs without taking their discoveries away from them.',
    contributions: ['Provide club-level oversight and support across both teams.', 'Help students work through mechanical and manufacturing decisions.', 'Bring experience with materials, drive arrangements and weapon design to reviews.', 'Support Marc and the team leads while keeping detailed design ownership with the builders.'],
    sections: [
      {title: 'Two robots, two sets of choices', paragraphs: ['The teams are currently planning one vertical spinner and one horizontal spinner, each in the 3 lb class. Both are in the design phase.', 'I have helped the vertical-spinner team consider materials, direct and indirect drive arrangements, weapon bite, rake, energy and ways to manufacture their parts. Those choices are connected: a promising mechanism still has to fit the weight budget and be practical to build.']},
      {title: 'Guidance without taking over', paragraphs: ['I help the teams design and build, but try to leave the specific direction and discoveries to them. A useful review should help a builder understand the tradeoffs and make a better decision, rather than simply replace their idea with mine.', 'The project’s current story is about setting up that process and supporting the design work. Build, test and competition results will become part of the page as the robots take shape.']}
    ],
    outcome: {title: 'The next milestone is the build.', text: 'The vertical- and horizontal-spinner concepts are in development. No completed robots or fight results are being claimed at this stage.'},
    gallery: [{key: 'workshop', alt: 'Students working together at a WE FIRST electronics workshop.', caption: 'The hands-on learning environment behind WE FIRST’s projects and workshops.'}],
    referenceMedia: {
      notice: 'The BotBrawl photographs and video below show other teams and the competition we are preparing for. They are temporary reference media, not WE FIRST builds, attendance or results. We will replace them with our own build and competition footage as the project progresses.',
      photos: [
        {key: 'botbrawl-fight', alt: 'NV and Cyclone facing each other inside the BotBrawl combat arena.', caption: 'NV and Cyclone at the 2026 Summer Classic — an example of the 3 lb competition our teams are designing for.', credit: {label: 'Photo: Liam Haddock / BotBrawl Canada', url: 'https://botbrawl.ca/blog/recap-summer-classic-26'}},
        {key: 'botbrawl-shrubert', alt: 'Shrubert lifting JAK3 in a BotBrawl beetleweight match.', caption: 'Shrubert and JAK3 in the 2026 Summer Classic beetleweight bracket. These robots belong to other teams.', credit: {label: 'Photo: Liam Haddock / BotBrawl Canada', url: 'https://botbrawl.ca/blog/recap-summer-classic-26'}},
        {key: 'botbrawl-crowd', alt: 'Spectators gathered around a robot combat arena at the BotBrawl Summer Classic.', caption: 'Around the arena at Bingemans, Kitchener, during the 2026 Summer Classic.', credit: {label: 'Photo: Liam Haddock / BotBrawl Canada', url: 'https://botbrawl.ca/blog/recap-summer-classic-26'}}
      ],
      video: {
        id: 'XHBQaKOk97Y', title: 'BBRL Season 2 Week 3 Highlights', poster: 'botbrawl-fight',
        caption: 'Official highlights from Week 3 of BotBrawl Robot League Season 2. This is organizer footage of other teams; it does not show our robots.',
        credit: {label: 'Video: BotBrawl Canada', url: 'https://www.youtube.com/watch?v=XHBQaKOk97Y'}
      }
    },
    related: ['robotics-teaching', 'ri3d', 'frc-2024']
  },
  {
    slug: 'weather-lights', title: 'Weather lights', subtitle: 'The forecast, before the phone.',
    category: 'Embedded & controls', year: 'June–August 2026', role: 'Solo design & build', status: 'Installed and in use',
    tags: ['ESP32', 'Non-blocking C++', 'Product development'],
    cover: {key: 'weather-board', alt: 'The weather-light electronics assembled on a prototype board, connected to the LED system.', caption: 'The prototype-board electronics for the lights installed under my bed.', position: '50% 65%'},
    summary: 'An ESP32 lighting system that turns the morning forecast into colour, brightness and animation, without needing to open a phone.',
    context: 'I would check the weather to decide what to wear, then get distracted by messages, email and social media. I also prefer waking up to light rather than a noisy alarm. This project brings those two needs together.',
    contributions: ['Design and build the electronics on a prototype board.', 'Write the firmware, display logic and morning schedule.', 'Design and print the enclosure.', 'Install the lights under my bed and refine their daily operation.'],
    sections: [
      {title: 'A small display for an everyday decision', paragraphs: ['The LED strip alternates between temperature and weather. Temperature colours step through the morning, afternoon, evening and night forecast. Weather uses colour and effects such as rain flicker, lightning flashes and sunbeam patterns, with brightness related to cloud cover.', 'The display runs for 20 minutes at 7 a.m. on weekdays and 9 a.m. on weekends, then uses deep sleep between morning showings. It is deliberately something I can read without opening another screen.']},
      {title: 'Keeping the colour engines from fighting', paragraphs: ['Getting the temperature fades and weather effects to behave together was the main software challenge. Pattern effects could interfere with a transition and produce unexpected colours.', 'I separated temperature and weather into two colour engines, coordinated by a scheduler and fader. Weather effects pause while the fade runs, so the transition has a clear owner instead of competing updates.']},
      {title: 'Making it work at seven in the morning', paragraphs: ['Connection handling first attempts a fast reconnect to the last network, then retries a full connection. If necessary it sleeps briefly and retries again, eventually showing a distinct failure-only colour indication when weather data cannot be obtained.', 'Repeated ESP32 startup and serial failures led me to a supply-brownout problem during boot and Wi-Fi connection. Adding electrolytic and ceramic capacitance around the buck converter, plus capacitance between 3.3 V and ground, stabilized the board in my use. The circuit remains a prototype-board build, not a custom-manufactured PCB.']}
    ],
    outcome: {title: 'Built for my own morning routine.', text: 'I completed the project in late August and have used it under my bed for about a month at the time of writing. A personal frustration became a product I could design, build and use in my own room.'},
    gallery: [], related: ['pid-minibot', '6502-arm', 'baker-bot']
  },
  {
    slug: 'fio-production-engineering', title: 'Production engineering at FIO', subtitle: 'From watching a cell to improving its workflow.',
    category: 'Industry', year: 'Summer 2026', role: 'Production engineering co-op', status: 'Completed placement',
    tags: ['Root-cause analysis', 'SolidWorks', 'Manufacturing'],
    cover: {key: 'fio-logo', alt: 'FIO Automotive Canada Corporation logo: the green FIO Futaba leaf emblem.', caption: 'Production engineering co-op at FIO Automotive Canada. The public company logo identifies the employer; internal project photographs and drawings remain private.', kind: 'logo', credit: {label: 'Logo: FIO Automotive Canada / Futaba North America', url: 'https://www.futabanorthamerica.com/ontario'}},
    summary: 'Mechanical upgrades, prototype iteration and installation coordination in an active automotive welding environment.',
    context: 'At FIO Automotive Canada, I worked on welding equipment and production issues. My projects began with observing a cell and understanding the problem, then moved through design, testing, fabrication and installation.',
    contributions: ['Observe equipment and investigate production and quality issues.', 'Develop mechanical upgrade packages in SolidWorks.', 'Test 3D-printed prototypes and iterate from what happened in the cell.', 'Coordinate contractors, maintenance, tool-room staff and installation teams.'],
    sections: [
      {title: 'Removing a handling step', paragraphs: ['Hot MIG-welded parts needed to cool before entering the finished-goods bin. The existing workflow used separate cooling nests followed by a finished-part check.', 'I designed a chute that queued three parts for passive cooling and brought the lower part into a checker. Inductive and beam-break sensing checked selected features, with a blocker controlling access to the finished-goods bin. Bringing those steps together removed an extra transfer from the operator’s workflow.']},
      {title: 'Faster motion that still held the part', paragraphs: ['Increasing pneumatic flow made a clamp faster, but it began dropping the part. An external hydraulic damper slowed the last part of the motion while retaining faster travel earlier in the arc. Revised holding fingers and larger magnets also helped part retention.', 'Other changes addressed ejection binding through revised pins and locators with reduced contact. I also assisted a contractor with robot-motion and PLC changes. The contractor carried out that programming and robot teaching; my contribution was assistance and project coordination, not independent authorship of all the controls work.']},
      {title: 'Observation, prototypes and installation', paragraphs: ['I spent time at the cell watching the machinery before proposing changes. I then modelled upgrades, installed prototype parts during available downtime, tested them and revised the designs before arranging machining and installation.', 'I was the main contractor contact for my projects and sought support from my supervisor when needed. The same process supported quality work: trace a defect, prevent it at its source or improve the finished-part check, then validate a practical change.']},
      {title: 'Expanding the prototype station', paragraphs: ['I also obtained support for additional 3D-printing capability and designed an aluminum-extrusion and polycarbonate enclosure to house and protect the printers. It was a smaller project with the same path from a practical need through design, fabrication and installation.']}
    ],
    outcome: {title: 'Ownership through to installation.', text: 'The projects improved handling, equipment behaviour and production workflow. They gave me experience taking a practical problem from observation through mechanical design, prototype testing and coordinated installation.'},
    gallery: [], related: ['ri3d', 'weather-lights', 'baker-bot']
  },
  {
    slug: 'ri3d', title: 'Robot in Three Days', subtitle: 'A working prototype, on a very real deadline.',
    category: 'Robotics', year: 'January 2026', role: 'Event organizer · Mechanical lead', status: 'Prototype completed',
    tags: ['Rapid prototyping', 'DFM', 'System integration'],
    cover: {key: 'ri3d-team', alt: 'RI3D team members gathered behind their completed prototype robot.', caption: 'Some of the RI3D team with the prototype at the end of the build.'},
    summary: 'Organizing a three-day robot build and leading the mechanical work, with hands-on development of the shooter and indexer.',
    context: 'RI3D compresses a robot-development cycle into three days. I organized the event and led the mechanical systems while the team developed a functional prototype for the 2026 FIRST challenge.',
    contributions: ['Plan and organize the event with the executive team.', 'Lead the robot’s mechanical systems.', 'Help develop the shooter and indexer.', 'Work through feeding, jamming and shooter-compression iterations.'],
    sections: [
      {title: 'The feeding problem', paragraphs: ['Moving balls from storage into the shooter reliably was one of the hardest problems. Balls would jam rather than funnel into the firing path.', 'We used guiding wedges to direct the balls into an indexer that pushed them into the shooter. The solution needed to work as a whole path, not just as separately functional mechanisms.']},
      {title: 'Finding the right compression', paragraphs: ['The shooter wheels needed enough contact to launch the ball, but too much compression prevented it from passing through.', 'We made multiple versions of the motor and wheel mounts to adjust their spacing. Rapid fabrication made it possible to test that fit and revise it inside the event’s time limit.']},
      {title: 'Bringing the robot together', paragraphs: ['By the submission deadline, the robot could intake through a split-bumper intake, hold multiple balls, index and shoot them into the target hopper. The tank-drive arrangement could travel under the trench and over the field bump.', 'That result depended on mechanical, electrical and software teams bringing their work together. My technical contribution centred on mechanical leadership and the shooter/indexer; the full robot was a shared build.']}
    ],
    outcome: {title: 'A complete prototype by submission.', text: 'The team demonstrated intake, storage, indexing, shooting and field traversal. The project was as much about choosing workable designs and integrating them on time as it was about any one mechanism.'},
    gallery: [{key: 'ri3d-cad', alt: 'CAD view of the complete RI3D robot with its drivebase, storage and shooting mechanisms.', caption: 'The assembly used to plan the mechanical interfaces.'}, {key: 'ri3d-brainstorm', alt: 'RI3D participants brainstorming concepts together in a classroom.', caption: 'Early ideation before committing to the build.'}, {key: 'ri3d-cad-alt', alt: 'An alternate CAD view of the RI3D indexer and shooter arrangement.', caption: 'Another view of the packaging around the ball path.'}],
    model: 'ri3d', video: 'Z5k__DlGJLU', related: ['baker-bot', 'frc-2024', 'fio-production-engineering']
  },
  {
    slug: 'pid-minibot', title: 'PID minibot', subtitle: 'A robot for learning how control feels.',
    category: 'Embedded & controls', year: '14-week workshop series', role: 'Solo prototype · Workshop teaching', status: 'Teaching prototype built',
    tags: ['ESP32', 'Heading control', 'ESP-NOW'],
    cover: {key: 'minibot', alt: 'The ESP32 minibot prototype with its electronics, motors and distance sensor.', caption: 'The first-revision reference prototype I designed for the workshop series.', position: '50% 55%'},
    summary: 'A heading-controlled robot and live PID-tuning remote, developed as a reference for a 14-week WE FIRST workshop series.',
    context: 'I designed the mechanics, electronics and firmware of the first prototype myself to test the concept. We then taught club members how to design and build something similar through a 14-week series.',
    contributions: ['Design and build the first mechanical and electrical prototype.', 'Implement heading PID using IMU data.', 'Build an ESP-NOW remote for live tuning and heading commands.', 'Use the prototype to teach control and robot development.'],
    sections: [
      {title: 'A controller you can experiment with', paragraphs: ['The PID loop used IMU gyro/yaw data to regulate heading. A separate handheld controller let me update P, I and D independently and display their current values. A joystick changed the heading setpoint, and ESP-NOW carried the updates to the robot.', 'The distance sensor could detect walls, but I pointed mine toward the table so the robot could detect an edge and stop before driving off.']},
      {title: 'Keeping the loop responsive', paragraphs: ['Non-blocking software allowed the robot to read the IMU and update PID without waiting for controller transmissions or other slower tasks.', 'That separation became a useful pattern in later ESP32 work: time-sensitive control should not have to wait for unrelated input.']},
      {title: 'What the filtering could—and could not—fix', paragraphs: ['Vibration made yaw drift difficult to manage. High- and low-pass filtering, EMA smoothing and a dead zone reduced the problem, but did not eliminate it. Manual joystick nudges could compensate during a demo, but were not a complete solution.', 'If I rebuilt it, I would consider motor encoders and a magnetometer with sensor fusion. Those are redesign ideas, not features of this prototype. The imperfect behaviour itself became something useful to explain in a control demonstration.']}
    ],
    outcome: {title: 'A prototype that became a teaching tool.', text: 'The robot made live control tuning tangible and supported the workshop series. It also made a limitation clear: filtering alone was not a complete answer to accumulated yaw drift.'},
    gallery: [{key: 'minibot-remote', alt: 'Prototype ESP32 control hardware and wiring used with the minibot.', caption: 'Hardware development for the robot and live-tuning controls.'}, {key: 'workshop-2', alt: 'Students working on electronics at a WE FIRST workshop.', caption: 'From a reference prototype to hands-on learning with the club.'}],
    related: ['weather-lights', 'wec-2025', 'robotics-teaching']
  },
  {
    slug: 'wec-2025', title: 'WEC Senior Design', subtitle: 'Let the mechanics simplify the software.',
    category: 'Competitions', year: '2025', role: 'Electrical & software · Shared ideation', status: '2nd place', tone: 'award',
    tags: ['Arduino', 'Autonomous robotics', 'Rapid prototyping'],
    cover: {key: 'wec-robot', alt: 'The amphibious WEC robot with a wide front collection mechanism.', caption: 'Our autonomous amphibious vehicle for the Senior Design challenge.'},
    summary: 'Electrical and software development for an autonomous amphibious vehicle, with passive guidance and a conditional recovery mechanism.',
    context: 'The challenge was to cross from a sandy beach through water, collect floating Styrofoam “turtle eggs,” deliver them onto the opposite beach and return. We had to use supplied materials and electronics, with no commands during the run.',
    contributions: ['Complete the electrical work and Arduino software.', 'Contribute to the vehicle concept.', 'Program wall bias, ultrasonic turnaround sensing and filtering.', 'Add conditional timed recovery for the climb out of the water.'],
    sections: [
      {title: 'Choosing skids over active centering', paragraphs: ['An ultrasonic sensor could have actively centred the robot in the lane. Instead, we chose long skids against the side wall and slightly biased the drive toward it. That gave us a simple mechanical reference through the course.', 'The wide plow could collect balls across the lane, while the ultrasonic sensor detected the far end and triggered the turnaround before we pushed the balls off the safe beach.']},
      {title: 'Recovering when the climb stalled', paragraphs: ['The motors could struggle to pull the vehicle out of the water. A conditional timed servo action helped unstick it if the far-beach condition had not been detected. If it arrived successfully, the recovery action was suppressed.', 'I reused filtering and deadband experience from the minibot to manage noisy distance measurements. The electrical work, software, build and presentation preparation all had to fit a short overnight challenge.']}
    ],
    outcome: {title: 'Second in Senior Design.', text: 'The team’s result showed the value of a deliberately simple guidance strategy. I owned the electrical and software work; the mechanism and overall vehicle were a shared team design.'},
    gallery: [{key: 'wec-build', alt: 'Elias working on the competition robot at a lab bench.', caption: 'Electrical and software integration during the build.'}, {key: 'wec-team', alt: 'The four-person WEC Senior team holding their second-place certificate.', caption: 'Our team after placing second in 2025 Senior Design.'}],
    related: ['pid-minibot', 'wec-2024', 'ri3d']
  },
  {
    slug: 'wec-2024', title: 'WEC Junior Design', subtitle: 'Finding energy beyond the elastic bands.',
    category: 'Competitions', year: '2024', role: 'Launcher concept · Team build', status: '6th place',
    tags: ['Mechanism design', 'Flexures', 'Design tradeoffs'],
    cover: {key: 'wec-2024', alt: 'The crossbow-inspired launcher made from wooden sticks, cardboard and elastic bands.', caption: 'Our loaded launcher, built from the supplied craft materials.'},
    summary: 'A crossbow-inspired launcher that stored energy in wooden flexures as well as elastic bands, built under material and weight constraints.',
    context: 'The space-themed Junior Design task was to launch a Nerf dart as far as possible. The launcher had to remain loaded until a trigger was pressed, and weight was part of the judging.',
    contributions: ['Propose the crossbow-inspired launch concept.', 'Explore energy storage in bending wooden sticks.', 'Contribute to the team’s supplied-material build.'],
    sections: [
      {title: 'Using the wood as a spring', paragraphs: ['Most of the concepts we saw relied on elastic bands for stored energy. I proposed bending the popsicle-stick structure itself into large wooden flexures, with elastics connected to their ends.', 'The resulting crossbow-like arrangement stored energy in both the wood and bands. A clothespin provided the trigger so the launcher could sit ready before release.']},
      {title: 'Range was only one part of the brief', paragraphs: ['Our launcher achieved the longest shot in the division as I remember it, but it was heavy. Weight and presentation penalties brought our overall result to sixth.', 'The project is a compact example of a design tradeoff: optimizing one visible performance measure does not automatically satisfy the whole set of requirements.']}
    ],
    outcome: {title: 'A strong launch, with a tradeoff.', text: 'The flexure concept distinguished our launcher, while the sixth-place overall result reflected criteria beyond range. Weight and presentation mattered alongside the mechanism’s performance.'},
    gallery: [], related: ['wec-2025', 'frc-2024', 'ri3d']
  },
  {
    slug: '6502-arm', title: '6502 computer & robotic arm', subtitle: 'From data buses to inverse kinematics.',
    category: 'Embedded & controls', year: 'High school–first-year university', role: 'Personal learning build', status: 'Exploratory prototype',
    tags: ['6502 assembly', 'Peripheral interfaces', 'Inverse kinematics'],
    cover: {key: '6502', alt: 'The hand-assembled 6502 computer on connected breadboards.', caption: 'My 1 MHz computer, built from Ben Eater’s base design and extended for the arm.'},
    summary: 'A Ben Eater-based computer extended with joystick and servo interfaces, plus independently derived arm kinematics calculated in assembly.',
    context: 'This was one of my early personal projects: build a computer, understand its buses and addressing, then use it to solve and control something physical.',
    contributions: ['Build the computer from Ben Eater’s design.', 'Add joystick threshold inputs and bit-banged I2C through the VIA.', 'Derive a two-link geometric inverse-kinematics solution.', 'Implement arithmetic and trigonometric subroutines in 6502 assembly.'],
    sections: [
      {title: 'Giving the computer a physical interface', paragraphs: ['The computer ran at 1 MHz. To drive the arm’s servos, I connected a 16-channel I2C-to-PWM device and bit-banged the I2C signalling through the VIA. A joystick interface used voltage thresholds and a dead zone to turn analogue movement into digital direction inputs.', 'Ben Eater’s design supplied the computer foundation. The peripheral interfaces and arm program were my additions.']},
      {title: 'Calculating the angles on the computer', paragraphs: ['I did not want to rely only on a lookup table of precomputed servo angles. I independently worked through a geometric inverse-kinematics solution using two intersecting circles to locate the elbow, then calculated the relative shoulder and elbow angles.', 'To evaluate that solution on the computer, I first built arithmetic routines and Taylor-series-based trigonometric calculations in assembly. It was an opportunity to understand how mathematical operations can be built from much smaller machine-level steps.']},
      {title: 'The unresolved jitter', paragraphs: ['The arm moved, but the servos were not consistently stable. I could not fully determine whether the problem came from signalling, power or PWM configuration, and I did not have a logic analyzer to diagnose it properly.', 'That limitation is part of the outcome. The project taught me a great deal about low-level software and circuit debugging even though it did not become a precision arm.']}
    ],
    outcome: {title: 'A learning prototype, not a precision machine.', text: 'I built and extended a working computer and implemented the arm mathematics on it. Servo jitter remained unresolved. The circuit-debugging experience later helped me investigate problems in other embedded builds.'},
    gallery: [], related: ['weather-lights', 'pid-minibot', 'baker-bot']
  },
  {
    slug: 'frc-2024', title: 'FRC Team 9580', subtitle: 'A rookie season with a lot to learn.',
    category: 'Robotics', year: '2024 · Crescendo', role: 'Student captain · Mechanical leadership', status: 'Season completed',
    tags: ['Intake design', 'Fabrication', 'Student leadership'],
    cover: {key: 'frc-robot', alt: 'Team 9580’s 2024 FRC robot, showing the intake and main mechanism.', caption: 'The rookie-season robot, developed from the KitBot starting platform.'},
    summary: 'Captaining a rookie FRC team, developing the under-bumper intake, and contributing substantial mechanical fabrication and electrical work.',
    context: 'In Grade 12, I was the student captain for Team 9580’s first FRC season. With limited experience on the team, I worked broadly across mechanical design, fabrication and electrical systems.',
    contributions: ['Lead the student team and mechanical work.', 'Develop the under-bumper note intake.', 'Tune intake compression to bring game pieces into the robot.', 'Fabricate much of the indexing/shooting body and support the electrical build.'],
    sections: [
      {title: 'Getting the note into the robot', paragraphs: ['Our robot used a KitBot basis, with an under-bumper intake, internal indexer, top shooter and endgame climber. The intake is the clearest example of my own technical contribution.', 'I worked through how much compression the note needed to draw it from the floor into the robot. It was early experience with a mechanism that depends on physical contact, geometry and real game-piece behaviour rather than CAD alone.']},
      {title: 'Learning across the build', paragraphs: ['As captain of a new team, I also did a great deal of fabrication and helped with electrical work. The broad responsibility meant learning how the mechanisms, wiring and people fit together.', 'After high school, I carried that experience into mentoring Team 4617 at Western—first as a general mentor, then as lead mentor and WE FIRST president.']}
    ],
    outcome: {title: 'The start of a longer mentoring story.', text: 'The season developed my hands-on design and fabrication experience as well as my leadership. The rookie robot was a team build with an acknowledged KitBot starting point.'},
    gallery: [{key: 'frc-competition', alt: 'The FRC robot on the field at the Newmarket competition.', caption: 'Competing at Newmarket during the 2024 season.'}, {key: 'frc-team', alt: 'Team 9580 students and mentors standing with their robot.', caption: 'The team behind our rookie season.'}],
    related: ['ri3d', 'robotics-teaching', 'vex-kiwi-drive']
  },
  {
    slug: 'vex-kiwi-drive', title: 'VEX kiwi drive', subtitle: 'Three wheels. Translation and rotation together.',
    category: 'Robotics', year: 'Grade 12 · 2024', role: 'Drive design & movement controls', status: 'Prototype built',
    tags: ['Omnidirectional drive', 'Kinematics', 'Independent design'],
    cover: {key: 'vex', alt: 'The VEX robot with its three-wheel omnidirectional drivetrain and mechanisms.', caption: 'My VEX robot, built around the independently developed three-wheel drive.'},
    summary: 'Independently arriving at a kiwi-drive layout and writing its movement controls, including simultaneous translation and turning.',
    context: 'I wanted omnidirectional motion without the extra drive wheels and motors of the layouts I knew. I had not seen a kiwi drive at the time, so I worked through a three-wheel arrangement myself.',
    contributions: ['Develop the three-wheel, three-motor drive arrangement.', 'Write the directional and rotational movement controls from scratch.', 'Lead most of the robot’s design and build.', 'Integrate additional mechanisms, with a teammate contributing to the catapult.'],
    sections: [
      {title: 'Working through the motion', paragraphs: ['The controls combined each wheel’s contribution to the desired movement, with adjustable wheel offsets. They could command movement in any direction and add turning at the same time.', 'The result was an independently developed implementation of an established drive type. What mattered to me was arriving at the idea through my own reasoning and seeing it work on a physical robot.']},
      {title: 'A complete competition robot', paragraphs: ['The robot also had a catapult, an extending front ram and a rear climber. A teammate contributed to the catapult; I did most of the overall build and integration.', 'We took part in smaller inter-school competitions. The project remains a favourite example of the enjoyment I get from building something I have worked out for myself.']}
    ],
    outcome: {title: 'A physical result from independent reasoning.', text: 'The robot could combine translation and rotation. Developing the layout and controls myself helped me understand how the individual wheel motions combine into the movement of the whole robot.'},
    gallery: [], related: ['frc-2024', '6502-arm', 'pid-minibot']
  },
  {
    slug: 'robotics-teaching', title: 'Robotics leadership & teaching', subtitle: 'Helping people learn how to figure it out.',
    category: 'Community', year: 'High school–present', role: 'Club president · FRC lead mentor', status: 'Ongoing',
    tags: ['WE FIRST', 'FRC mentorship', 'Hands-on teaching'],
    cover: {key: 'workshop', alt: 'WE FIRST members learning electronics together at a workshop.', caption: 'A WE FIRST workshop: learning by building, testing and asking questions.'},
    summary: 'From an elementary after-school club to university workshops and FRC lead mentoring, teaching has grown alongside my technical work.',
    context: 'I enjoy helping people learn to research a problem, read a datasheet and develop their own solution. Robotics gives us something real to build and a reason to keep asking how it works.',
    contributions: ['Run WE FIRST and support its student projects and workshops.', 'Serve as lead mentor for FRC Team 4617 with faculty support.', 'Help students develop mechanical, electrical and problem-solving skills.', 'Organize learning opportunities such as the minibot series, soldering workshops and RI3D.'],
    sections: [
      {title: 'Starting with an after-school club', paragraphs: ['In Grades 11 and 12, I ran an elementary after-school VEX IQ club for 8–11 students each year. It was a club I organized, not a formal teaching job.', 'Teaching younger students alongside my own high-school robotics work introduced me to how much someone can learn by building, experimenting and explaining their decisions.']},
      {title: 'From student captain to lead mentor', paragraphs: ['After captaining Team 9580 in high school, I became a general mentor for Team 4617 in my first university year. I helped teach mechanical and some electrical skills and supported the elevator design for its Reefscape robot.', 'In second year I became WE FIRST president and lead mentor, adding team administration and management to the technical support. I continue in that role in third year, working with a faculty supervisor.']},
      {title: 'Teaching the process, not only the answer', paragraphs: ['In the university workshops, we do more than show finished PID code or a wiring diagram. We work on reading documentation, researching unfamiliar parts and learning how to approach the design.', 'The 14-week minibot series, soldering sessions and student projects are different ways to give people that experience. The goal is for members to grow into builders who can make their own decisions.']}
    ],
    outcome: {title: 'Lady Godiva Award · 2026', text: 'I received the Lady Godiva Award in the winter term of second year, recognizing commitment to the Western Engineering community through WE FIRST, robotics teaching and FRC mentoring.'},
    gallery: [{key: 'award', alt: 'Elias receiving the Lady Godiva Award at the engineering formal.', caption: 'Receiving the Lady Godiva Award at the 2026 engineering formal.'}, {key: 'recruiting', alt: 'WE FIRST recruitment conversations with students.', caption: 'Welcoming students into the club.'}, {key: 'workshop-2', alt: 'A room of students working on electronics during a workshop.', caption: 'Hands-on workshop time with WE FIRST.'}],
    related: ['pid-minibot', 'frc-2024', 'combat-robotics']
  }
];

export const categories = ['All', 'Robotics', 'Embedded & controls', 'Competitions', 'Industry', 'Community'];

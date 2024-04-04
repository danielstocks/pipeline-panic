// Draw SVGS progrmatically in future?
// https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle?rq=3
// http://jsbin.com/quhujowota/1/edit?html,js,output

function svg(strings: TemplateStringsArray) {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 200 200">
  ${strings}
  </svg>
  `;
}

export const straight = svg`
<path class="pipe" stroke="#00B78B" stroke-width="50" d="M100 0v200"/>
<path class="fill" pathLength="1000" stroke="#D5665F" stroke-opacity=".8" stroke-width="40" d="M100 0v200" />
`;

export const bend = svg`
<path class="pipe" stroke="#00B78B" stroke-width="50" d="M200 100c-79.244 0-99.685 66.667-100 100"/>
<path class="fill" pathLength="1000" stroke="#D5665F" stroke-opacity=".8" stroke-width="40" d="M200 100c-79.244 0-99.685 66.667-100 100"/>
`;

export const short = svg`
<path class="pipe" stroke="#00B78B" stroke-width="50" d="M100 100v100"/>
<path class="fill" pathLength="1000" stroke="#D5665F" stroke-opacity=".8"  stroke-width="40" d="M100 100v100"/>
`;

export const cross = svg`
<path class="pipe" stroke="#00B78B" stroke-width="50" d="M100 0v200M200 100H0"/>
<path class="fill" pathLength="1000" stroke="#D5665F" stroke-opacity=".8" stroke-width="40" d="M100 2v200M200 100H0"/>
`;

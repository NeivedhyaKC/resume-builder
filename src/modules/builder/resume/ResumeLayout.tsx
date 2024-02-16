import { Context, createContext, useEffect, useRef } from 'react';

import { AVAILABLE_TEMPLATES } from 'src/helpers/constants';
import { ThemeProvider } from '@mui/material/styles';
import { useResumeStore } from 'src/stores/useResumeStore';
import { useTemplates } from 'src/stores/useTemplate';
import { useThemes } from 'src/stores/themes';
import { useZoom } from 'src/stores/useZoom';
import { useEvent } from 'src/helpers/utils/eventProvider';
import juice from 'juice';
const htmlDocx = require('html-docx-js/dist/html-docx');
// Now you can save or handle the generated DOCX file as needed.

// TODO: need to define types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let StateContext: Context<any> = createContext(null);

export const ResumeLayout = () => {
  const resumeData = useResumeStore();
  const zoom = useZoom((state) => state.zoom);

  const templateId = useTemplates((state) => state.activeTemplate.id);
  const Template = AVAILABLE_TEMPLATES[templateId].component;
  const selectedTheme = useThemes((state) => state.selectedTheme);
  StateContext = createContext(resumeData);

  useEffect(() => {
    const selectedTemplateId =
      localStorage.getItem('selectedTemplateId') || AVAILABLE_TEMPLATES['modern'].id;
    useTemplates.getState().setTemplate(AVAILABLE_TEMPLATES[selectedTemplateId]);
  }, []);

  return (
    <div className="mx-5 print:mx-0 mb-2 print:mb-0 ">
      <div
        style={{ transform: `scale(${zoom})` }}
        className="origin-top transition-all duration-300 ease-linear	print:!scale-100"
      >
        <script src="https://rawgit.com/eKoopmans/html2pdf/master/dist/html2pdf.bundle.js"></script>
        {/* this is the div to ref */}
        <div className="w-[210mm] h-[296mm] bg-white my-0 mx-auto">
          <StateContext.Provider value={resumeData}>
            <ThemeProvider theme={selectedTheme}>{Template && <Template />}</ThemeProvider>
          </StateContext.Provider>
        </div>
      </div>
    </div>
  );
};

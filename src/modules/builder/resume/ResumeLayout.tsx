import { Context, createContext, useEffect, useRef } from 'react';

import { AVAILABLE_TEMPLATES } from 'src/helpers/constants';
import { ThemeProvider } from '@mui/material/styles';
import { useResumeStore } from 'src/stores/useResumeStore';
import { useTemplates } from 'src/stores/useTemplate';
import { useThemes } from 'src/stores/themes';
import { useZoom } from 'src/stores/useZoom';
import { useEvent } from 'src/helpers/utils/eventProvider';
import { saveAs } from 'file-saver';
import juice from 'juice';
const htmlDocx = require('html-docx-js/dist/html-docx');
// Now you can save or handle the generated DOCX file as needed.

// TODO: need to define types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let StateContext: Context<any> = createContext(null);

export const ResumeLayout = () => {
  const { onEvent, emitEvent } = useEvent();
  const resumeDiv = useRef<HTMLDivElement>(null);
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

  onEvent('onDownloadDocxClicked', () => {
    convertToBlob();
  });

  const convertToBlob = () => {
    if (resumeDiv.current) {
      const divContentString =
        "<body> <p className='bg-blue-400'>blue</p> <p style='color:red'>adawd</p>" +
        resumeDiv.current.outerHTML +
        '</body>';
      const styles = document.querySelectorAll('style');
      for (let style of styles) {
        if (
          style.innerHTML.startsWith(
            '/*\n! tailwindcss v3.0.23 | MIT License | https://tailwindcss.com\n*//*\n1.'
          )
        ) {
          let finalString = juice.inlineContent(divContentString, style.innerHTML, {
            applyStyleTags: false,
          });
          console.log('s');
          console.log(finalString);
        }
      }

      const docx = htmlDocx.asBlob(divContentString, {
        orientation: 'landscape',
        margins: { top: 720 },
      });
      saveAs(docx, 'b.docx');
    }
  };

  return (
    <div className="mx-5 print:mx-0 mb-2 print:mb-0 ">
      <div
        style={{ transform: `scale(${zoom})` }}
        className="origin-top transition-all duration-300 ease-linear	print:!scale-100"
      >
        {/* this is the div to ref */}
        <div className="w-[210mm] h-[296mm] bg-white my-0 mx-auto" ref={resumeDiv}>
          <StateContext.Provider value={resumeData}>
            <ThemeProvider theme={selectedTheme}>{Template && <Template />}</ThemeProvider>
          </StateContext.Provider>
        </div>
      </div>
    </div>
  );
};

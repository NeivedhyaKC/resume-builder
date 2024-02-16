'use client';
import { ChangeEvent, useCallback, useRef, useState } from 'react';
import { NavBarActions, NavBarMenu, StyledButton } from './atoms';
import {
  useDatabases,
  useFrameworks,
  useLanguages,
  useLibraries,
  usePractices,
  useTechnologies,
  useTools,
} from 'src/stores/skills';

import { AVAILABLE_TEMPLATES } from 'src/helpers/constants';
import DEFAULT_RESUME_JSON from 'src/helpers/constants/resume-data.json';
import Image from 'next/image';
import Link from 'next/link';
import { NavMenuItem } from './components/MenuItem';
import { PrintResume } from './components/PrintResume';
import { TemplateSelect } from './components/TemplateSelect';
import { ThemeSelect } from './components/ThemeSelect';
import { Toast } from 'src/helpers/common/atoms/Toast';
import exportFromJSON from 'export-from-json';
import { useActivity } from 'src/stores/activity';
import { useAwards } from 'src/stores/awards';
import { useBasicDetails } from 'src/stores/basic';
import { useEducations } from 'src/stores/education';
import { useExperiences } from 'src/stores/experience';
import { useVoluteeringStore } from 'src/stores/volunteering';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

const TOTAL_TEMPLATES_AVAILABLE = Object.keys(AVAILABLE_TEMPLATES).length;

let PizZipUtils: any = null;
if (typeof window !== 'undefined') {
  import('pizzip/utils/index.js').then(function (r) {
    PizZipUtils = r;
  });
}

function loadFile(url: String, callback: any) {
  PizZipUtils.getBinaryContent(url, callback);
}

function generateDocument() {
  loadFile('/Untitled.docx', function (error: String, content: PizZip.LoadData) {
    if (error) {
      throw error;
    }
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      linebreaks: true,
      paragraphLoop: true,
    });
    const updatedResumeJson = {
      ...DEFAULT_RESUME_JSON,
      basics: {
        ...DEFAULT_RESUME_JSON.basics,
        ...useBasicDetails.getState().values,
      },
      work: useExperiences.getState().experiences,
      education: useEducations.getState().academics,
      awards: useAwards.getState().awards,
      volunteer: useVoluteeringStore.getState().volunteeredExps,
      skills: {
        languages: useLanguages.getState().get(),
        frameworks: useFrameworks.getState().get(),
        technologies: useTechnologies.getState().get(),
        libraries: useLibraries.getState().get(),
        databases: useDatabases.getState().get(),
        practices: usePractices.getState().get(),
        tools: useTools.getState().get(),
      },
      activities: useActivity.getState().activities,
    };
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render({
      name: updatedResumeJson.basics.name,
      label: updatedResumeJson.basics.label,
      phone: updatedResumeJson.basics.phone,
      email: updatedResumeJson.basics.email,
      city: updatedResumeJson.basics.location.city,
      summary: updatedResumeJson.basics.summary,
      objective: updatedResumeJson.basics.objective,
      work: updatedResumeJson.work,
      awards: updatedResumeJson.awards,
      languages: updatedResumeJson.skills.languages,
      technologies: updatedResumeJson.skills.technologies,
      frameworks: updatedResumeJson.skills.frameworks,
      tools: updatedResumeJson.skills.tools,
      education: updatedResumeJson.education,
      volunteer: updatedResumeJson.volunteer,
    });
    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    // Output the document using Data-URI
    saveAs(blob, 'output.docx');
  });
}

const NavBarLayout = () => {
  const [openToast, setOpenToast] = useState(false);
  const fileInputRef = useRef(null);

  // const onDownloadDocxClicked = useCallback(() => {
  //   emitEvent('onDownloadDocxClicked');
  // }, []);

  const onDownloadDocxClicked = useCallback(async () => {
    generateDocument();
  }, []);

  const exportResumeData = useCallback(() => {
    const updatedResumeJson = {
      ...DEFAULT_RESUME_JSON,
      basics: {
        ...DEFAULT_RESUME_JSON.basics,
        ...useBasicDetails.getState().values,
      },
      work: useExperiences.getState().experiences,
      education: useEducations.getState().academics,
      awards: useAwards.getState().awards,
      volunteer: useVoluteeringStore.getState().volunteeredExps,
      skills: {
        languages: useLanguages.getState().get(),
        frameworks: useFrameworks.getState().get(),
        technologies: useTechnologies.getState().get(),
        libraries: useLibraries.getState().get(),
        databases: useDatabases.getState().get(),
        practices: usePractices.getState().get(),
        tools: useTools.getState().get(),
      },
      activities: useActivity.getState().activities,
    };
    const fileName = updatedResumeJson.basics.name + '_' + new Date().toLocaleString();
    const exportType = exportFromJSON.types.json;
    exportFromJSON({
      data: updatedResumeJson,
      fileName,
      exportType,
    });
  }, []);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }

    const reader = new FileReader();

    reader.readAsText(fileObj);

    event.target.value = ''; // To read the same file

    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        const uploadedResumeJSON = JSON.parse(e.target?.result);
        const {
          basics = {},
          skills = {},
          work = [],
          education = [],
          activities = {
            involvements: '',
            achievements: '',
          },
          volunteer = [],
          awards = [],
        } = uploadedResumeJSON;
        const {
          languages = [],
          frameworks = [],
          libraries = [],
          databases = [],
          technologies = [],
          practices = [],
          tools = [],
        } = skills;
        useBasicDetails.getState().reset(basics);
        useLanguages.getState().reset(languages);
        useFrameworks.getState().reset(frameworks);
        useLibraries.getState().reset(libraries);
        useDatabases.getState().reset(databases);
        useTechnologies.getState().reset(technologies);
        usePractices.getState().reset(practices);
        useTools.getState().reset(tools);
        useExperiences.getState().reset(work);
        useEducations.getState().reset(education);
        useVoluteeringStore.getState().reset(volunteer);
        useAwards.getState().reset(awards);
        useActivity.getState().reset(activities);
        setOpenToast(true);
      }
    };
  }, []);

  return (
    <nav className="h-14 w-full bg-resume-800 relative flex py-2.5 pl-5 pr-4 items-center shadow-level-8dp z-20 print:hidden">
      <Link href="/">
        <Image src={'/icons/resume-icon.png'} alt="logo" height="36" width="36" />
      </Link>
      <div className="flex-auto flex justify-between items-center ml-5">
        <NavBarMenu>
          <NavMenuItem
            caption={`Templates (${TOTAL_TEMPLATES_AVAILABLE})`}
            popoverChildren={<TemplateSelect />}
          />
          <NavMenuItem caption="Colours" popoverChildren={<ThemeSelect />} />
        </NavBarMenu>
        <NavBarActions>
          <StyledButton variant="text" onClick={exportResumeData}>
            Export
          </StyledButton>
          <StyledButton
            variant="text"
            onClick={() => {
              if (fileInputRef.current) {
                const fileElement = fileInputRef.current as HTMLInputElement;
                fileElement.click();
              }
            }}
          >
            Import{' '}
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="application/json"
              onChange={handleFileChange}
            />
          </StyledButton>
          <PrintResume />
          <StyledButton variant="outlined" onClick={() => onDownloadDocxClicked()}>
            Download as Docx
          </StyledButton>
        </NavBarActions>
      </div>
      <Toast
        open={openToast}
        onClose={() => {
          setOpenToast(false);
        }}
        content={'Resume data was successfully imported.'}
      />
    </nav>
  );
};

export default NavBarLayout;

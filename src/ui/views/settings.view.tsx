import clsx from 'clsx';
import { useState } from 'react';
import { AutoStartSetting } from '../components/settings/AutoStartSetting.component';
import { CheckForUpdates } from '../components/settings/checkForUpdates.component';
import { EditorsLocation } from '../components/settings/EditorLocation.component';
import { GitToolSettings } from '../components/settings/gitToolSettings.component';
import { ProjectLaunchAction } from '../components/settings/projectLaunchAction.component';
import { ProjectsLocation } from '../components/settings/projectsLocation.component';
import { VSCodeToolSettings } from '../components/settings/vsCodeToolSettings.component';
import { usePreferences } from '../hooks/usePreferences';
import { useTheme } from '../hooks/useTheme';

export const SettingsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'projects' | 'installs' | 'appearance' | 'behavior' | 'tools' | 'updates'>('projects');
    const { preferences, savePreferences, platform } = usePreferences();

    const { theme, setTheme } = useTheme();



    return (
        <>
            <div className="flex flex-col h-full w-full p-1">
                <div className="flex flex-col gap-2 w-full">

                    <div className="flex flex-row justify-between">
                        <h1 data-testid="settingsTitle" className="text-2xl">Settings</h1>
                        <div className="flex gap-2">
                        </div>
                    </div>
                </div>
                <div className="divider m-0 my-2"></div>

                <div className="flex flex-col gap-0 flex-1">
                    {/* Tabs */}
                    <div role="tablist" className="flex tabs tabs-lifted">
                        <a data-testid="tabProjects" onClick={() => setActiveTab('projects')} role="tab" className={clsx('tab', { 'tab-active': (activeTab === 'projects') })}>Projects</a>
                        <a data-testid="tabInstalls" onClick={() => setActiveTab('installs')} role="tab" className={clsx('tab', { 'tab-active': (activeTab === 'installs') })}>Installs</a>
                        <a data-testid="tabAppearance" onClick={() => setActiveTab('appearance')} role="tab" className={clsx('tab', { 'tab-active': (activeTab === 'appearance') })}>Appearance</a>
                        <a data-testid="tabBehavior" onClick={() => setActiveTab('behavior')} role="tab" className={clsx('tab', { 'tab-active': (activeTab === 'behavior') })}>Behavior</a>
                        <a data-testid="tabTools" onClick={() => setActiveTab('tools')} role="tab" className={clsx('tab', { 'tab-active': (activeTab === 'tools') })}>Tools</a>
                        <a data-testid="tabUpdates" onClick={() => setActiveTab('updates')} role="tab" className={clsx('tab', { 'tab-active': (activeTab === 'updates') })}>Updates</a>
                    </div >

                    {/* Scrollable Content */}
                    <div className={clsx('flex flex-col py-6 flex-1 max-h-full border border-base-300 border-t-0 bg-base-100 rounded-box overflow-hidden', { 'rounded-tl-none': (activeTab === 'projects') })}>
                        <div className="flex-1 overflow-y-auto px-6">

                            {/* Projects */}
                            <div className={clsx('flex flex-col h-0 gap-4', { 'hidden': (activeTab !== 'projects') })}>
                                <ProjectsLocation />
                            </div>

                            {/* Installs */}
                            <div className={clsx('flex flex-col h-0 gap-4 ', { 'hidden': (activeTab !== 'installs') })}>
                                <EditorsLocation />

                            </div>

                            {/* Appearance */}
                            <div className={clsx('flex flex-col h-0 gap-4', { 'hidden': (activeTab !== 'appearance') })}>
                                {/* theme */}
                                <div className="flex flex-col">
                                    <h1 data-testid="themeHeader" className="font-bold">Theme</h1>
                                    <p data-testid="themeSubHeader" className="text-sm">Customize the appearance for Godot Launcher</p>
                                    <div className=" flex flex-row flex-0 p-4 gap-4">
                                        <label className="flex flex-row  items-center justify-start  gap-4 cursor-pointer ">
                                            <input onChange={(e) => { if (e.target.checked) setTheme('light'); }} data-testid="themeLight" type="radio" name="theme-select" className="radio checked:bg-current" checked={theme === 'light'} />
                                            <span className="">Light</span>
                                        </label>
                                        <label className="flex flex-row   items-center justify-start gap-4 cursor-pointer ">
                                            <input onChange={(e) => { if (e.target.checked) setTheme('dark'); }} data-testid="themeDark" type="radio" name="theme-select" className="radio checked:bg-current" checked={theme === 'dark'} />
                                            <span className="">Dark</span>
                                        </label>
                                        <label className="flex flex-row  items-center justify-start gap-4 cursor-pointer">
                                            <input onChange={(e) => { if (e.target.checked) setTheme('auto'); }} data-testid="themeAuto" type="radio" name="theme-select" className="radio checked:bg-current" checked={theme === 'auto'} />
                                            <span className="">System (automatic)</span>
                                        </label>

                                    </div>
                                </div>
                                <div className="divider"></div>


                                <div className="flex flex-col">
                                    <h1 data-testid="languageHeader" className="font-bold">Language</h1>
                                    <p data-testid="languageSubHeader" className="text-sm">Select language for Godot Launcher (does not change Godot language)</p>
                                    <div className=" flex flex-col p-4 gap-4">
                                        <div className="flex flex-row flex-shrink items-center justify-start gap-4 ">
                                            <select
                                                value={'en'}
                                                data-testid="languageSelect"
                                                className="select select-bordered w-full max-w-xs" disabled>
                                                <option data-testid="languageSelectEnglish" value={'en'} >English</option>
                                                <option data-testid="languageSelectSpanish" value={'es'}>Spanish</option>
                                            </select>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Behavior */}
                            <div className={clsx('flex flex-col h-0 gap-4 ', { 'hidden': (activeTab !== 'behavior') })}>

                                <div className="flex flex-col gap-4">
                                    <div>
                                        <h1 data-testid="projectsSettingsHeader" className="font-bold">Projects</h1>
                                        <p data-testid="projectsSettingsSubHeader" className="text-sm">Choose Godot Launcher behavior for projects.</p>
                                    </div>
                                    <div className=" flex flex-col gap-8">
                                        <label className="flex flex-row items-start cursor-pointer gap-4">
                                            <input type="checkbox" className="checkbox"
                                                data-testid="chkConfirmProjectRemoveCheckbox"
                                                checked={preferences?.confirm_project_remove}
                                                onChange={(e) => {
                                                    if (preferences) {
                                                        savePreferences({ ...preferences, confirm_project_remove: e.target.checked });
                                                    }
                                                }} />
                                            <span className="">Ask for confirmation when removing projects.</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="divider"></div>

                                <ProjectLaunchAction />
                                <div className="divider"></div>
                                <AutoStartSetting />

                                {platform === 'win32' && (
                                    <>
                                        <div className="divider"></div>
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <h2 className="font-bold">Windows editor links</h2>
                                                <p className="text-sm text-base-content/70">
                                                    Choose how Godot Launcher connects editors to your projects on Windows.
                                                </p>
                                            </div>
                                            <label className="flex flex-row items-start cursor-pointer gap-4">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={preferences?.use_windows_symlinks ?? true}
                                                    onChange={(e) => {
                                                        if (preferences) {
                                                            savePreferences({
                                                                ...preferences,
                                                                use_windows_symlinks: e.target.checked,
                                                            });
                                                        }
                                                    }}
                                                />
                                                <span className="flex flex-col gap-2">
                                                    <span className="font-semibold">Use symbolic links for project editors</span>
                                                    <span className="text-sm text-base-content/70">
                                                        Keeps project setups small and lets editor updates roll out instantly. Disable this if creating links prompts for administrator access or if you prefer full copies instead.
                                                    </span>
                                                </span>
                                            </label>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Tools */}
                            <div className={clsx('flex flex-col h-0 gap-4 ', { 'hidden': (activeTab !== 'tools') })}>

                                <GitToolSettings />
                                <div className="divider"></div>
                                <VSCodeToolSettings />

                            </div>

                            {/* Updates */}
                            <div className={clsx('flex flex-col h-0 gap-4 ', { 'hidden': (activeTab !== 'updates') })}>
                                <CheckForUpdates />
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </>);
};
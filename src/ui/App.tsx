import React, { useEffect } from 'react';

import './App.css';

import IconDiscord from './assets/icons/Discord-Symbol-Blurple.svg';

import clsx from 'clsx';
import { CircleHelp, HardDrive, Package, Settings } from 'lucide-react';
import { COMMUNITY_DISCORD_URL } from './constants';
import { useApp } from './hooks/useApp';
import { useAppNavigation, View } from './hooks/useAppNavigation';
import { usePreferences } from './hooks/usePreferences';
import { useRelease } from './hooks/useRelease';
import { HelpVIew } from './views/help.view';
import { InstallsView } from './views/installs.view';
import { ProjectsView } from './views/projects.view';
import { SettingsView } from './views/settings.view';
import { WelcomeView } from './views/welcome.view';

import logo from './assets/logo.png';
import { WindowsStep } from './components/welcomeSteps/WindowsStep';

function App() {
    const [loading, setLoading] = React.useState(true);
    const [prefsLoading, setPrefsLoading] = React.useState(true);
    const [firstRun, setFirstRun] = React.useState(false);

    const { currentView, setCurrentView, openExternalLink } = useAppNavigation();

    const { installedReleases, loading: releaseLoading } = useRelease();
    const { preferences, platform, updatePreferences } = usePreferences();

    const { updateAvailable, installAndRelaunch } = useApp();
    // set the title of the app
    const version = import.meta.env.VITE_APP_VERSION;
    document.title = `Godot Launcher ${version}`;


    useEffect(() => {
        if (!preferences) {
            return;
        }

        setFirstRun(preferences.first_run || false);

        // Windows users on the legacy onboarding (prefs v1) must complete the
        // symlink notice before migrations continue.
        if (preferences.prefs_version === 1 && platform === 'win32') {
            setPrefsLoading(false);
            return;
        }

        const updates: Partial<UserPreferences> = {};

        if (preferences.prefs_version === 1 && platform !== 'win32') {
            updates.prefs_version = 2;
        }

        if (preferences.prefs_version < 3 || preferences.use_windows_symlinks === undefined) {
            updates.prefs_version = 3;
            updates.use_windows_symlinks = preferences.use_windows_symlinks ?? true;
        }

        if (Object.keys(updates).length > 0) {
            updatePreferences(updates);
        }

        setPrefsLoading(false);
    }, [preferences, platform, updatePreferences]);

    useEffect(() => {

        if (!releaseLoading) {
            setLoading(false);
            if (installedReleases.length < 1) {
                setCurrentView('installs');
            }
        }

        setFirstRun(preferences?.first_run || false);

    }, [releaseLoading]);

    const changeView = (view: View) => {
        setCurrentView(view);
    };

    const ShowView = () => {
        switch (currentView) {
            case 'projects':
                return <ProjectsView />;
            case 'installs':
                return <InstallsView />;
            case 'settings':
                return < SettingsView />;
            case 'help':
                return < HelpVIew />;
        }
    };

    if (loading || prefsLoading) {
        return <div className="flex flex-col items-center justify-center fixed inset-0 z-50 bg-base-100 gap-4">
            <img src={logo} alt="Godot Launcher Logo" className="w-10 h-10 animate-pulse" />
            <span className="">Getting things ready...</span>
        </div>;
    }

    if (firstRun) {
        return <WelcomeView />;
    }

    // if the user is on windows and the prefs_version is 1, show the windows step
    // this is a one time step, so we can just show it and then update the prefs_version
    if (preferences?.prefs_version === 1 && platform === 'win32') {
        return (
            <div className='flex flex-col items-center justify-start w-full h-full'>
                <div className="flex flex-col h-[535px] w-[1008px] p-10">
                    <WindowsStep />
                    <div className='flex-1'></div>
                    <div className='flex justify-center'>
                        <button className="btn btn-primary" onClick={() => {
                            updatePreferences({ prefs_version: 3, use_windows_symlinks: true });
                        }}>Continue</button>
                    </div>
                </div >
            </div>
        );
    }

    return (
        <div className="flex h-full overflow-hidden">
            <div className="flex flex-col h-full w-56 border-r-2 border-solid border-base-200">
                <ul className="menu rounded-box w-56 gap-2">
                    <li><a data-testid='btnProjects' className={clsx({ active: currentView === 'projects' })} onClick={() => changeView('projects')}><Package /> Projects</a></li>
                    <li><a data-testid="btnInstalls" className={clsx({ active: currentView === 'installs' })} onClick={() => changeView('installs')}> <HardDrive />Installs</a>
                        {installedReleases.length < 1 &&
                            <span className="absolute w-10 h-10 text-warning left-2 bottom-0 loading loading-ring"></span>
                        }</li>
                </ul>
                <div className="flex flex-1"></div>
                {(updateAvailable && updateAvailable?.type === 'ready') && (
                    <div className="gap-2 p-4 m-2 text-sm text-info rounded-xl bg-base-200">
                        {updateAvailable?.version ? `Version ${updateAvailable?.version}` : 'A new version'} is available, restart Godot Launcher to install. <button onClick={installAndRelaunch} className="underline cursor-pointer hover:no-underline">Restart now.</button>
                    </div>
                )}
                <div className="border-t-2 border-solid border-base-200">
                    {/* <div className="flex flex-row items-center mx-2 rounded p-2 bg-info/50 h-10 text-xs text-white">Update Available</div> */}
                    <ul className="menu rounded-box w-56 gap-1 ">
                        <li>
                            <button data-testid="btnDiscord" className="relative" onClick={() => openExternalLink(COMMUNITY_DISCORD_URL)}>
                                <img src={IconDiscord} alt="Discord" className="w-6 h-6" />Join Community
                            </button>
                        </li>

                        <li>
                            <a data-testid="btnHelp" className={clsx('relative', { active: currentView === 'help' })} onClick={() => changeView('help')}>
                                <CircleHelp />Help</a>
                        </li>

                        <li className="">
                            <a data-testid="btnSettings" className={clsx('relative', { active: currentView === 'settings' })} onClick={() => changeView('settings')}>
                                <Settings />Settings

                            </a></li>
                    </ul>
                </div>
                <div className="flex flex-col">

                </div>
            </div>

            <div className="flex flex-row flex-1 p-2 bg-base-200">
                {ShowView()}
            </div>
        </div>
    );
}

export default App;

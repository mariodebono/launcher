import * as fs from 'node:fs';
import * as path from 'node:path';
import { SymlinkOptions, trySymlinkOrElevateAsync } from './fs.utils.js';
import logger from 'electron-log';

export async function removeProjectReleaseEditorWindows(
    projectEditorPath: string,
    release: InstalledRelease
) {
    if (!fs.existsSync(projectEditorPath)) {
        return;
    }

    // remove all files based on mono or not
    const baseFileName = path.basename(release.editor_path);
    const exePath = path.resolve(projectEditorPath, baseFileName);
    const consolePath = path.resolve(
        projectEditorPath,
        baseFileName.replace('.exe', '_console.exe')
    );

    logger.debug('Removing project editor exe and console exe');
    logger.debug('Exe path:', exePath);
    logger.debug('Console path:', consolePath);
    logger.debug('Release mono:', release.mono);
    logger.debug('Release path:', release.editor_path);
    logger.debug('Project editor path:', projectEditorPath);
    logger.debug('base file name:', baseFileName);
    logger.debug(
        'Project editor path exists:',
        fs.existsSync(projectEditorPath)
    );
    logger.debug('Exe path exists:', fs.existsSync(exePath));
    logger.debug('Console path exists:', fs.existsSync(consolePath));

    await fs.promises.rm(exePath, { force: true });
    await fs.promises.rm(consolePath, { force: true });

    if (release.mono) {
        const sharpDir = path.resolve(projectEditorPath, 'GodotSharp');
        await fs.promises.rm(sharpDir, { recursive: true, force: true });
    }
}

export async function removeProjectEditorWindows(
    project: ProjectDetails
): Promise<void> {
    await removeProjectReleaseEditorWindows(
        path.dirname(project.launch_path),
        project.release
    );
}

export async function setProjectEditorReleaseWindows(
    projectEditorPath: string,
    release: InstalledRelease,
    previousRelease?: InstalledRelease,
    useSymlinks = true
): Promise<LaunchPath> {
    // remove previous editor
    if (previousRelease) {
        logger.debug('Removing previous editor');
        // remove exe, console.exe and GodotSharp folder
        await removeProjectReleaseEditorWindows(projectEditorPath, previousRelease);
    }

    logger.debug('Setting new editor');
    // set dstination paths
    const baseFileName = path.basename(release.editor_path);
    const dstExePath = path.resolve(projectEditorPath, baseFileName);
    const dstConsolePath = path.resolve(
        projectEditorPath,
        baseFileName.replace('.exe', '_console.exe')
    );
    const dstSharpDir = path.resolve(projectEditorPath, 'GodotSharp');

    // set source paths
    const srcExePath = path.resolve(release.install_path, baseFileName);
    const srcConsolePath = path.resolve(
        release.install_path,
        baseFileName.replace('.exe', '_console.exe')
    );
    const srcSharpDir = path.resolve(release.install_path, 'GodotSharp');

    // check if source paths exist
    if (fs.existsSync(srcExePath) && fs.existsSync(srcConsolePath)) {
        logger.debug('Source paths exist');

        const copyEditorFiles = async () => {
            await fs.promises.rm(dstExePath, { force: true });
            await fs.promises.rm(dstConsolePath, { force: true });
            await fs.promises.rm(dstSharpDir, { recursive: true, force: true });
            await fs.promises.cp(srcExePath, dstExePath);
            await fs.promises.cp(srcConsolePath, dstConsolePath);
            if (release.mono && fs.existsSync(srcSharpDir)) {
                await fs.promises.mkdir(dstSharpDir, { recursive: true });
                await fs.promises.cp(srcSharpDir, dstSharpDir, { recursive: true });
            }
        };

        if (useSymlinks) {
            // combine links
            const links: SymlinkOptions[] = [
                { target: srcExePath, path: dstExePath, type: 'file' },
                { target: srcConsolePath, path: dstConsolePath, type: 'file' },
            ];

            if (release.mono && fs.existsSync(srcSharpDir)) {
                links.push({
                    target: srcSharpDir,
                    path: dstSharpDir,
                    type: 'dir',
                });
            }

            try {
                // try to symlink then use with elevated permissions
                await trySymlinkOrElevateAsync(links);
            } catch (error) {
                logger.warn('Failed to create symlinks, falling back to copy mode');
                logger.warn(error);
                await copyEditorFiles();
            }
        } else {
            await copyEditorFiles();
        }
    }
    // create new editor

    return dstExePath;
}

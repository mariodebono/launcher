import type { CopyOptions, MakeDirectoryOptions, RmOptions } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SymlinkOptions } from './fs.utils.js';

const { existsSyncMock, rmMock, cpMock, mkdirMock } = vi.hoisted(() => ({
    existsSyncMock: vi.fn<(target: string) => boolean>(),
    rmMock: vi.fn<(path: string, options?: RmOptions) => Promise<void>>(),
    cpMock: vi.fn<(src: string, dest: string, options?: CopyOptions) => Promise<void>>(),
    mkdirMock: vi.fn<(dir: string, options?: MakeDirectoryOptions) => Promise<void>>(),
}));

vi.mock('node:fs', () => ({
    existsSync: existsSyncMock,
    promises: {
        rm: rmMock,
        cp: cpMock,
        mkdir: mkdirMock,
    },
}));

const { trySymlinkOrElevateAsyncMock } = vi.hoisted(() => ({
    trySymlinkOrElevateAsyncMock: vi.fn<(links: SymlinkOptions[]) => Promise<void>>(),
}));

vi.mock('./fs.utils.js', () => ({
    trySymlinkOrElevateAsync: trySymlinkOrElevateAsyncMock,
}));

vi.mock('electron-log', () => ({
    default: {
        debug: vi.fn(),
        log: vi.fn(),
        warn: vi.fn(),
    },
}));

import { setProjectEditorReleaseWindows } from './godot.utils.windows.js';

const baseRelease: InstalledRelease = {
    version: '4.2.1',
    version_number: 40201,
    install_path: '/tmp/godot',
    editor_path: '/tmp/godot/Godot.exe',
    platform: 'win32',
    arch: 'x86_64',
    mono: false,
    prerelease: false,
    config_version: 5,
    published_at: null,
    valid: true,
};

describe('setProjectEditorReleaseWindows', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        existsSyncMock.mockReset();
        rmMock.mockReset();
        cpMock.mockReset();
        mkdirMock.mockReset();
        trySymlinkOrElevateAsyncMock.mockReset();
        existsSyncMock.mockReturnValue(true);
        rmMock.mockResolvedValue(undefined);
        cpMock.mockResolvedValue(undefined);
        mkdirMock.mockResolvedValue(undefined);
        trySymlinkOrElevateAsyncMock.mockResolvedValue(undefined);
    });

    it('creates symlinks when enabled', async () => {
        existsSyncMock.mockImplementation((target: string) => {
            if (target === path.resolve(baseRelease.install_path, 'GodotSharp')) {
                return false;
            }
            if (target === path.resolve('/project/editors', 'Godot.exe')) {
                return false;
            }
            if (target === path.resolve('/project/editors', 'Godot_console.exe')) {
                return false;
            }
            return true;
        });

        const launchPath = await setProjectEditorReleaseWindows('/project/editors', baseRelease, undefined, true);

        const expectedLinks = [
            {
                target: path.resolve(baseRelease.install_path, 'Godot.exe'),
                path: path.resolve('/project/editors', 'Godot.exe'),
                type: 'file' as const,
            },
            {
                target: path.resolve(baseRelease.install_path, 'Godot_console.exe'),
                path: path.resolve('/project/editors', 'Godot_console.exe'),
                type: 'file' as const,
            },
        ];

        expect(trySymlinkOrElevateAsyncMock).toHaveBeenCalledWith(expectedLinks);
        expect(cpMock).not.toHaveBeenCalled();
        expect(rmMock).not.toHaveBeenCalled();
        expect(launchPath).toBe(path.resolve('/project/editors', 'Godot.exe'));
    });

    it('copies editor files when symlinks are disabled', async () => {
        const monoRelease: InstalledRelease = { ...baseRelease, mono: true };

        existsSyncMock.mockImplementation((target: string) => {
            if (target === path.resolve(monoRelease.install_path, 'GodotSharp')) {
                return true;
            }
            return true;
        });

        const launchPath = await setProjectEditorReleaseWindows('/project/editors', monoRelease, undefined, false);

        expect(trySymlinkOrElevateAsyncMock).not.toHaveBeenCalled();
        expect(rmMock).toHaveBeenCalledWith(path.resolve('/project/editors', 'Godot.exe'), { force: true });
        expect(rmMock).toHaveBeenCalledWith(path.resolve('/project/editors', 'Godot_console.exe'), { force: true });
        expect(rmMock).toHaveBeenCalledWith(path.resolve('/project/editors', 'GodotSharp'), { recursive: true, force: true });
        expect(cpMock).toHaveBeenCalledWith(path.resolve(monoRelease.install_path, 'Godot.exe'), path.resolve('/project/editors', 'Godot.exe'));
        expect(cpMock).toHaveBeenCalledWith(path.resolve(monoRelease.install_path, 'Godot_console.exe'), path.resolve('/project/editors', 'Godot_console.exe'));
        expect(cpMock).toHaveBeenCalledWith(path.resolve(monoRelease.install_path, 'GodotSharp'), path.resolve('/project/editors', 'GodotSharp'), { recursive: true });
        expect(mkdirMock).toHaveBeenCalledWith(path.resolve('/project/editors', 'GodotSharp'), { recursive: true });
        expect(launchPath).toBe(path.resolve('/project/editors', 'Godot.exe'));
    });
});

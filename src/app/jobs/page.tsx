'use client';

import React from 'react';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import Jobs from '@/components/jobs/JobsContent';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function JobsPage() {
    const ctrl = useAppControllerContext();

    if (!ctrl.isInitialized || ctrl.showLoading) {
        return <LoadingScreen onFinished={() => { }} />;
    }

    return (
        <Jobs
            jobs={ctrl.systemJobs}
            onBack={() => ctrl.updateHash('/')}
            isEnabled={ctrl.systemSettings.jobsModuleEnabled}
        />
    );
}

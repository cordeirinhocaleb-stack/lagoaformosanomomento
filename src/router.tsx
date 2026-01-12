import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAppController } from "../hooks/useAppController";
import Home from "../pages/Home";
import Admin from "../pages/Admin/index";
import Login from "../components/Login";

export const AppRouter: React.FC = () => {
    const ctrl = useAppController();
    const { modals } = ctrl;

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            news={ctrl.news}
                            advertisers={ctrl.advertisers}
                            user={ctrl.user}
                            onNewsClick={(n) => {
                                ctrl.setSelectedNews(n);
                                ctrl.setView('details');
                                ctrl.updateHash(`/news/${n.id}`);
                            }}
                            onAdvertiserClick={(ad) => {
                                if (ad.redirectType === 'external') {
                                    window.open(ad.externalUrl, '_blank');
                                } else {
                                    ctrl.setSelectedAdvertiser(ad);
                                    ctrl.setView('advertiser');
                                }
                            }}
                            onAdminClick={() => {
                                if (ctrl.user?.role !== 'Leitor') {
                                    ctrl.setView('admin');
                                } else {
                                    modals.setShowProfileModal(true);
                                }
                            }}
                            onPricingClick={() => modals.setShowPricingModal(true)}
                            onJobsClick={() => {
                                ctrl.setView('jobs');
                                ctrl.updateHash('/jobs');
                            }}
                            adConfig={ctrl.adConfig}
                            externalCategories={ctrl.externalCategories}
                            selectedCategory={ctrl.selectedCategory}
                            onSelectCategory={ctrl.handleCategorySelection}
                            selectedRegion={ctrl.selectedRegion}
                            onSelectRegion={(r) => {
                                ctrl.setSelectedRegion(r);
                                ctrl.setView('home');
                                ctrl.setShouldScrollToGrid(true);
                            }}
                            shouldScrollToGrid={ctrl.shouldScrollToGrid}
                            onScrollConsumed={() => ctrl.setShouldScrollToGrid(false)}
                        />
                    }
                />
                <Route
                    path="/admin"
                    element={
                        ctrl.user && ctrl.user.role !== 'Leitor' ? (
                            <Admin
                                user={ctrl.user}
                                newsHistory={ctrl.news}
                                allUsers={ctrl.users}
                                advertisers={ctrl.advertisers}
                                adConfig={ctrl.adConfig}
                                systemSettings={ctrl.systemSettings}
                                jobs={ctrl.systemJobs}
                                auditLogs={ctrl.auditLogs}
                                onAddNews={async (n) => {
                                    ctrl.setNews((p) => [n, ...p]);
                                }}
                                onUpdateNews={async (n) => {
                                    ctrl.setNews((p) => p.map((x) => (x.id === n.id ? n : x)));
                                }}
                                onDeleteNews={async (id) => {
                                    ctrl.setNews((p) => p.filter((x) => x.id !== id));
                                }}
                                onUpdateUser={async (u) => {
                                    ctrl.setUsers((p) => p.map((x) => (x.id === u.id ? u : x)));
                                }}
                                onUpdateAdvertiser={async (a) => {
                                    ctrl.setAdvertisers((p) => p.map((x) => (x.id === a.id ? a : x)));
                                }}
                                onUpdateAdConfig={(c) => ctrl.setAdConfig(c)}
                                onUpdateSystemSettings={ctrl.handleUpdateSystemSettings}
                                onLogout={ctrl.handleLogout}
                                onNavigateHome={() => ctrl.setView('home')}
                                initialNewsToEdit={ctrl.adminNewsToEdit}
                            />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />
                <Route
                    path="/login"
                    element={
                        <Login
                            onLogin={(user, remember) => {
                                ctrl.setUser(user);
                                const storage = remember ? localStorage : sessionStorage;
                                storage.setItem('lfnm_user', JSON.stringify(user));
                                ctrl.setView('home');
                            }}
                            onSignupRequest={(email) => {
                                modals.setPendingManualEmail(email);
                                modals.setShowRoleSelector(true);
                            }}
                            onClose={() => ctrl.setView('home')}
                        />
                    }
                />
                {/* fallback to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

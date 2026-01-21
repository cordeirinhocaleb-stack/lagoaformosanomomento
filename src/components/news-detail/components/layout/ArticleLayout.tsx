import React from 'react';

interface ArticleLayoutProps {
    children: React.ReactNode;
}

const ArticleLayout: React.FC<ArticleLayoutProps> = ({ children }) => {
    return (
        <div className="w-full">
            {children}
        </div>
    );
};

export default ArticleLayout;
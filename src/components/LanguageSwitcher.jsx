import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);

    const languages = [
        { key: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
        { key: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
        { key: 'en', label: 'English', flag: '🇺🇸' },
        { key: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    ];

    const currentLanguage = languages.find(lang => lang.key === i18n.language) || languages[0];

    const handleLanguageChange = ({ key }) => {
        console.log('Changing language to:', key);
        i18n.changeLanguage(key);
        setOpen(false);
    };

    const items = languages.map(lang => ({
        key: lang.key,
        label: (
            <div className="flex items-center gap-2 px-2 py-1">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
            </div>
        ),
    }));

    return (
        <Dropdown
            menu={{
                items,
                onClick: handleLanguageChange,
                selectedKeys: [i18n.language],
            }}
            placement="bottomRight"
            trigger={['click']}
            open={open}
            onOpenChange={setOpen}
        >
            <div
                className="flex items-center gap-2 cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(!open);
                }}
            >
                <GlobalOutlined className="text-lg" />
                <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.label}</span>
                <span className="sm:hidden">{currentLanguage.flag}</span>
            </div>
        </Dropdown>
    );
};

export default LanguageSwitcher;

import { Fragment, FunctionalComponent, h, render } from 'preact';
import Banner from './banner';
import Customization from './customization';
import { useEffect } from 'preact/hooks';
import { Category, Config, CookieOption, CookieOptions } from '../types';
import useCookie from '../hooks/useCookie';
import './app.css';

interface Props extends Config {
  setVisible(value: boolean): void;
}

export const isEssential = (category: Category) => category === Category.Essential;

export const App: FunctionalComponent<Props> = ({
  policies,
  cookiePreferenceKey,
  header,
  cookiePolicy,
  permissionLabels,
  setVisible,
  onPreferencesChanged,
}) => {
  const { getCookiePreferences, setCookiePreferences } = useCookie({
    cookieOptions: policies.map(policy => ({
      id: policy.id,
      isEnabled: isEssential(policy.category) ? true : false,
    })),
    cookiePreferenceKey,
    onPreferencesChanged,
  });
  const getCookieOptions = (): CookieOptions => {
    const preferences = getCookiePreferences();
    const cookieOptions = preferences.cookieOptions.map(option => {
      const policyToMerge = policies.find(policy => policy.id === option.id);
      return { ...policyToMerge, ...option } as CookieOption;
    });

    return { ...preferences, cookieOptions };
  };
  const cookiePreferences = getCookieOptions();

  useEffect(() => {
    const container = document.querySelector('.cookie-though') as HTMLElement;
    container.style.bottom = `-${container.clientHeight}px`;
    if (!cookiePreferences.isCustomised) {
      setVisible(true);
    }
  }, [cookiePreferences, setVisible]);

  return (
    <Fragment>
      <Banner header={header} />
      <Customization
        cookieOptions={cookiePreferences.cookieOptions}
        cookiePolicy={cookiePolicy}
        permissionLabels={permissionLabels}
        setVisible={setVisible}
        setCookiePreferences={setCookiePreferences}
      />
    </Fragment>
  );
};

const setVisible = (value: boolean) => {
  if (value) {
    return document.querySelector('.cookie-though')?.classList.add('visible');
  }
  document.querySelector('.cookie-though')?.classList.remove('visible');
};

const CookieThough = {
  init(config: Config) {
    const container = document.createElement('div');
    container.className = 'cookie-though';
    const shadowRoot = container.attachShadow({ mode: 'open' });
    const cssLink = document.createElement('link');
    cssLink.setAttribute('rel', 'stylesheet');
    cssLink.setAttribute(
      'href',
      `https://unpkg.com/cookie-though@${process.env.GIT_TAG}/dist/app.css`,
    );
    shadowRoot.appendChild(cssLink);

    const previousInstance = document.querySelector('.cookie-though') as HTMLElement;
    if (previousInstance && previousInstance.shadowRoot) {
      render(h(App, { ...config, setVisible }), previousInstance.shadowRoot);
      return { setVisible };
    }

    document.body.append(container);
    render(h(App, { ...config, setVisible }), shadowRoot);
    return { setVisible };
  },
};

export default CookieThough;

import { FadeLink } from '/src/components/utilities';

function NamedLink(name, url) {
    this.name = name;
    this.url = url;
    this.GetElement = () => {
        return (
            <FadeLink to={this.url}>
                {this.name}
            </FadeLink>
        );
    }
}

export default [
    new NamedLink("Terms of Service", "/tos"),
    new NamedLink("Privacy Policy", "/privacy_policy"),
    new NamedLink("Cookie Policy", "/cookie_policy"),
    new NamedLink("Accessibility", "/accessibility"),
    new NamedLink("Ads Info", "/ads_info"),
    new NamedLink("Y for Business", "/business"),
    new NamedLink("Blog", "/blog"),
];

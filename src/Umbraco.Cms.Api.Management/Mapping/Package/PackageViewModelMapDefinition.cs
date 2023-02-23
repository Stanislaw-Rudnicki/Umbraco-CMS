using Umbraco.Cms.Api.Common.ViewModels.Pagination;
using Umbraco.Cms.Api.Management.ViewModels.Package;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Mapping;
using Umbraco.Cms.Core.Packaging;

namespace Umbraco.Cms.Api.Management.Mapping.Package;

public class PackageViewModelMapDefinition : IMapDefinition
{
    public void DefineMaps(IUmbracoMapper mapper)
    {
        mapper.Define<PackageModelBase, PackageDefinition>((_, _) => new PackageDefinition(), Map);
        mapper.Define<PackageDefinition, PackageDefinitionViewModel>(
            (_, _) => new PackageDefinitionViewModel
            {
                Name = string.Empty,
                PackagePath = string.Empty
            },
            Map);
        mapper.Define<InstalledPackage, PackageMigrationStatusViewModel>((_, _) => new PackageMigrationStatusViewModel { PackageName = string.Empty }, Map);
        mapper.Define<IEnumerable<PackageDefinition>, PagedViewModel<PackageDefinitionViewModel>>((_, _) => new PagedViewModel<PackageDefinitionViewModel>(), Map);
    }

    // Umbraco.Code.MapAll -Id -PackageId -PackagePath -Macros
    private static void Map(PackageModelBase source, PackageDefinition target, MapperContext context)
    {
        target.Name = source.Name;
        target.ContentLoadChildNodes = source.ContentLoadChildNodes;
        target.ContentNodeId = source.ContentNodeId;
        target.Languages = source.Languages;
        target.DictionaryItems = source.DictionaryItems;
        target.Templates = source.Templates;
        target.PartialViews = source.PartialViews;
        target.DocumentTypes = source.DocumentTypes;
        target.MediaTypes = source.MediaTypes;
        target.Stylesheets = source.Stylesheets;
        target.Scripts = source.Scripts;
        target.DataTypes = source.DataTypes;
        target.MediaUdis = source.MediaKeys.Select(x => new GuidUdi(Constants.UdiEntityType.Media, x)).ToList();
        target.MediaLoadChildNodes = source.MediaLoadChildNodes;
    }

    // Umbraco.Code.MapAll
    private static void Map(PackageDefinition source, PackageDefinitionViewModel target, MapperContext context)
    {
        target.Key = source.PackageId;
        target.Name = source.Name;
        target.PackagePath = source.PackagePath;
        target.ContentNodeId = source.ContentNodeId;
        target.ContentLoadChildNodes = source.ContentLoadChildNodes;
        target.MediaKeys = source.MediaUdis.Select(x => x.Guid).ToList();
        target.MediaLoadChildNodes = source.MediaLoadChildNodes;
        target.DocumentTypes = source.DocumentTypes;
        target.MediaTypes = source.MediaTypes;
        target.DataTypes = source.DataTypes;
        target.Templates = source.Templates;
        target.PartialViews = source.PartialViews;
        target.Stylesheets = source.Stylesheets;
        target.Scripts = source.Scripts;
        target.Languages = source.Languages;
        target.DictionaryItems = source.DictionaryItems;
    }

    // Umbraco.Code.MapAll
    private static void Map(InstalledPackage source, PackageMigrationStatusViewModel target, MapperContext context)
    {
        if (source.PackageName is not null)
        {
            target.PackageName = source.PackageName;
        }

        target.HasPendingMigrations = source.HasPendingMigrations;
    }

    // Umbraco.Code.MapAll
    private static void Map(IEnumerable<PackageDefinition> source, PagedViewModel<PackageDefinitionViewModel> target, MapperContext context)
    {
        PackageDefinition[] definitions = source.ToArray();
        target.Items = context.MapEnumerable<PackageDefinition, PackageDefinitionViewModel>(definitions);
        target.Total = definitions.Length;
    }
}
